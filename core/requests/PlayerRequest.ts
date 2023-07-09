import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested
} from 'class-validator';
import { PlayerMainHand } from '../enums/PlayerMainHand';
import { PlayerBackhand } from '../enums/PlayerBackhand';
import { Country } from '../enums/Country';
import { PlayerCategory } from '../enums/PlayerCategory';
import { Type } from 'class-transformer';

class PlayerInfoRequest {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsNotEmpty()
  picture: string;

  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Country)
  country: Country;

  @IsEnum(PlayerCategory)
  category: PlayerCategory;
}

class PlayerStyleRequest {
  @IsNotEmpty()
  @IsEnum(PlayerMainHand)
  mainHand: PlayerMainHand;

  @IsNotEmpty()
  @IsEnum(PlayerBackhand)
  backhand: PlayerBackhand;
}

class PlayerRequest {
  @IsObject()
  @ValidateNested({ always: true })
  @Type(() => PlayerInfoRequest)
  infos: PlayerInfoRequest;

  @IsObject()
  @ValidateNested()
  @Type(() => PlayerStyleRequest)
  style: PlayerStyleRequest;

  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(2020)
  proSince: number;
}

class GetPlayersRequest {
  skip = 0;

  results = 10;

  name = '';

  category = undefined as unknown as PlayerCategory;

  exclude = '';
}

export { PlayerRequest, PlayerInfoRequest, PlayerStyleRequest, GetPlayersRequest };
