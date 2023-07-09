import {
  PlayerBackhand,
  PlayerMainHand,
  PlayerCategory,
  Country
} from 'core/enums';
import { IPlayer, IPlayerInfo, IPlayerStyle } from 'core/interfaces';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested
} from 'class-validator';
import { PlayerRequest } from 'core/requests/PlayerRequest';

class PlayerInfo implements IPlayerInfo {
  @Column({ type: 'varchar' })
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @Column({ type: 'varchar' })
  @IsNotEmpty()
  @MinLength(2)
  lastName: string;

  @Column({ type: 'varchar', length: 4 })
  @IsDateString()
  dateOfBirth: string;

  @Column({ type: 'varchar', length: 4 })
  @IsEnum(Country)
  country: Country;

  @Column({ type: 'varchar' })
  @IsNotEmpty()
  @IsString()
  picture: string;

  @Column({ type: 'varchar' })
  @IsEnum(PlayerCategory)
  category: PlayerCategory;
}

class PlayerStyle implements IPlayerStyle {
  @Column({ type: 'number', length: 1 })
  @IsEnum(PlayerMainHand)
  mainHand: PlayerMainHand;

  @Column({ type: 'number', length: 1 })
  @IsEnum(PlayerBackhand)
  backhand: PlayerBackhand;
}

class Player implements IPlayer {
  constructor(player: PlayerRequest | PlayerEntity) {
    this.proSince = player.proSince;
    this.infos = player.infos;
    this.style = player.style;
    this.createdAt = new Date().toISOString();
  }

  @IsString()
  _id: ObjectId;

  @ValidateNested()
  @IsObject()
  @Type(() => PlayerInfo)
  infos: PlayerInfo;

  @ValidateNested()
  @IsObject()
  @Type(() => PlayerStyle)
  style: PlayerStyle;

  @IsOptional()
  @Min(1800)
  @Max(2020)
  proSince?: number;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  @IsOptional()
  updatedAt?: string;

  @IsDateString()
  @IsOptional()
  deletedAt?: string;
}

@Entity('players')
class PlayerEntity implements IPlayer {
  @ObjectIdColumn({ select: true })
  @Expose()
  @Transform((params: { obj: { _id: ObjectId } }) => params.obj._id.toString())
  _id: ObjectId;

  @Column(() => PlayerInfo)
  infos: PlayerInfo;

  @Column(() => PlayerStyle)
  style: PlayerStyle;

  @Column({ type: 'date' })
  proSince?: number;

  @CreateDateColumn({ update: false, type: 'varchar', select: false })
  createdAt: string = new Date().toISOString();

  @UpdateDateColumn({ insert: false, type: 'varchar', select: false })
  updatedAt?: string;

  @DeleteDateColumn({
    insert: false,
    type: 'varchar',
    select: false,
    update: false
  })
  deletedAt?: string;
}

export { Player, PlayerInfo, PlayerStyle, PlayerEntity };
