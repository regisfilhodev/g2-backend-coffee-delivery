import { Coffee } from '../entities/coffee.entity';

export class CoffeeResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  tags: { id: string; name: string }[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(coffee: Coffee): CoffeeResponseDto {
    const dto = new CoffeeResponseDto();
    dto.id = coffee.id;
    dto.name = coffee.name;
    dto.description = coffee.description;
    dto.price = Number(coffee.price);
    dto.imageUrl = coffee.imageUrl;
    dto.tags = coffee.tags || [];
    dto.createdAt = coffee.createdAt;
    dto.updatedAt = coffee.updatedAt;
    return dto;
  }
} 