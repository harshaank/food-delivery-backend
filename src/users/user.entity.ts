import { InternalServerErrorException } from '@nestjs/common';
import { BeforeInsert, Column, Entity } from 'typeorm';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from 'src/common/entities/core.entity';
import { IsEmail, IsEnum, IsString } from 'class-validator';

enum UserRole {
  Owner,
  Client,
  Delivery,
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field(type => String)
  @Column()
  @IsEmail()
  email: string;

  @Field(type => String)
  @Column()
  @IsString()
  password: string;

  @Field(type => UserRole)
  @Column({ type: 'enum', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
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
