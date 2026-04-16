import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,


  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Busca de perfis',
    description:
      '**Localizacao e identidade:** `city` (slug, sem diferenciar maiusculas), `gender`, `q` (substring em nome ou descricao; `%` e `_` sao tratados como texto literal).\n\n' +
      '**Precos:** `price_min`, `price_max` (hora), `price_night_min`, `price_night_max`.\n\n' +
      '**Servico:** `has_place`, `attends_hotels`, `attends_homes`, `verified` (true/false).\n\n' +
      '**Aparência (OR com virgula):** `eye_color`, `hair_color`, `skin_color`, `body_type`, `ethnicity` — ex.: `eye_color=azul,verde`.\n\n' +
      '**Medidas:** `age_min`, `age_max`, `height_min`/`height_max`, `weight_min`/`weight_max`.\n\n' +
      '**Paginacao:** `limit` (1–100, padrao 30), `offset` (padrao 0).\n\n' +
      '**Ordenacao `sort`:** `created_desc` (padrao), `created_asc`, `price_hour_asc`, `price_hour_desc`, `price_night_asc`, `price_night_desc`.',
  })
  @ApiOkResponse({ description: 'Resultado da busca retornado com sucesso' })
  @ApiBadRequestResponse({ description: 'Filtros de busca invalidos' })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }
}
