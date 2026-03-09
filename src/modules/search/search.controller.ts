import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOkResponse({ description: 'Resultado da busca retornado com sucesso' })
  @ApiBadRequestResponse({ description: 'Filtros de busca invalidos' })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }
}
