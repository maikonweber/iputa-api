import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type AzureDetectFaceItem = {
  faceRectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  faceAttributes?: {
    age: number;
  };
};

@Injectable()
export class FaceVerificationService {
  private readonly logger = new Logger(FaceVerificationService.name);

  constructor(private readonly config: ConfigService) {}

  private getBaseUrl(): string {
    const raw =
      this.config.get<string>('AZURE_FACE_ENDPOINT') ??
      this.config.get<string>('AZURE_COGNITIVE_ENDPOINT');
    if (!raw?.trim()) {
      throw new ServiceUnavailableException(
        'Azure Face nao configurado: defina AZURE_FACE_ENDPOINT (ex.: https://SEU_RECURSO.cognitiveservices.azure.com/)',
      );
    }
    return raw.replace(/\/+$/, '');
  }

  private getApiKey(): string {
    const key =
      this.config.get<string>('AZURE_FACE_KEY') ??
      this.config.get<string>('AZURE_COGNITIVE_KEY');
    if (!key?.trim()) {
      throw new ServiceUnavailableException(
        'Azure Face nao configurado: defina AZURE_FACE_KEY',
      );
    }
    return key;
  }

  async analyzeFaceAge(
    image: Buffer,
    contentType: string,
    minimumAge: number,
  ) {
    const baseUrl = this.getBaseUrl();
    const apiKey = this.getApiKey();

    const params = new URLSearchParams({
      returnFaceId: 'false',
      returnFaceAttributes: 'age',
      detectionModel: 'detection_03',
    });

    const url = `${baseUrl}/face/v1.0/detect?${params.toString()}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': contentType,
      },
      body: new Uint8Array(image),
    });

    const text = await res.text();
    if (!res.ok) {
      this.logger.warn(`Azure Face error ${res.status}: ${text.slice(0, 500)}`);
      if (res.status === 401 || res.status === 403) {
        throw new ServiceUnavailableException(
          'Credenciais Azure Face invalidas ou sem permissao',
        );
      }
      if (res.status === 429) {
        throw new ServiceUnavailableException(
          'Limite de uso da API Azure Face excedido; tente novamente mais tarde',
        );
      }
      throw new BadRequestException(
        'Falha ao analisar imagem no Azure Face. Verifique formato e tamanho.',
      );
    }

    let faces: AzureDetectFaceItem[];
    try {
      faces = JSON.parse(text) as AzureDetectFaceItem[];
    } catch {
      this.logger.error('Resposta inesperada do Azure Face');
      throw new ServiceUnavailableException('Resposta invalida do Azure Face');
    }

    if (!Array.isArray(faces)) {
      throw new ServiceUnavailableException('Resposta invalida do Azure Face');
    }

    if (faces.length === 0) {
      throw new BadRequestException('Nenhum rosto detectado na imagem');
    }

    if (faces.length > 1) {
      throw new BadRequestException(
        'A foto deve conter exatamente um rosto visivel',
      );
    }

    const age = faces[0].faceAttributes?.age;
    if (age === undefined || Number.isNaN(age)) {
      throw new BadRequestException(
        'Nao foi possivel estimar a idade para este rosto',
      );
    }

    const meetsMinimumAge = age >= minimumAge;

    return {
      estimatedAge: Math.round(age * 10) / 10,
      minimumAge,
      meetsMinimumAge,
      faceRectangle: faces[0].faceRectangle,
      disclaimer:
        'Idade estimada por servico de visao computacional; nao substitui documento oficial.',
    };
  }
}
