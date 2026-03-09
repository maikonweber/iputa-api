import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CitiesService } from './cities.service';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  @ApiOkResponse({ description: 'Lista de cidades retornada com sucesso' })
  findAll() {
    return this.citiesService.findAll();
  }

  @Get(':slug')
  @ApiOkResponse({ description: 'Cidade encontrada com sucesso' })
  @ApiNotFoundResponse({ description: 'Cidade nao encontrada' })
  findBySlug(@Param('slug') slug: string) {
    return this.citiesService.findBySlug(slug);
  }
}
