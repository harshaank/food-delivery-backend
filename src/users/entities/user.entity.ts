import {InternalServerErrorException} from '@nestjs/common';
import {BeforeInsert, BeforeUpdate, Column, Entity, OneToMany} from 'typeorm';
import {Field, InputType, ObjectType, registerEnumType} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import {IsBoolean, IsEmail, IsEnum, IsString} from 'class-validator';
import {CoreEntity} from 'src/common/entities/core.entity';
import {Restaurant} from 'src/restaurants/entities/restaurant.entity';

enum UserRole {
  Owner,
  Client,
  Delivery,
}

registerEnumType(UserRole, {name: 'UserRole'});

@InputType('UserInputType', {isAbstract: true})
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field(type => String)
  @Column({unique: true})
  @IsEmail()
  email: string;

  @Field(type => String)
  @Column({select: false})
  @IsString()
  password: string;

  @Field(type => UserRole)
  @Column({type: 'enum', enum: UserRole})
  @IsEnum(UserRole)
  role: UserRole;

  @Field(type => Boolean)
  @Column({default: false})
  @IsBoolean()
  emailVerified: boolean;

  @Field(type => [Restaurant])
  @OneToMany(type => Restaurant, restaurant => restaurant.owner)
  restaurants: Restaurant[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    try {
      const isEqual = await bcrypt.compare(password, this.password);
      return isEqual;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
