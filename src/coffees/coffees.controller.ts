import { Controller, Get, Post, Patch, Delete, Body, Param, HttpStatus, HttpCode, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { IsOptional, IsString, IsDateString, IsArray, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class SearchCoffeesDto {
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Get()
  async findAll() {
    return this.coffeesService.findAll();
  }

  @Get('search')
  async search(@Query() searchParams: SearchCoffeesDto) {
    const { start_date, end_date, name, tags, limit = 10, offset = 0 } = searchParams;
    
    return this.coffeesService.searchCoffees({
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      name,
      tags: tags ? tags.split(',') : [],
      limit,
      offset,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coffeesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  // adicionar outro endpoints
  @Post('/coffee')
  createCoffee(@Body() coffee: CreateCoffeeDto) {
    return this.coffeesService.create(coffee);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCoffeeDto: UpdateCoffeeDto,
  ) {
    const updatedCoffee = await this.coffeesService.update(id, updateCoffeeDto);
    return {
      message: 'Café atualizado com sucesso',
      data: updatedCoffee,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.coffeesService.remove(id);
  }
} 