import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {GraphQLModule} from '@nestjs/graphql';

import {DatabaseModule} from './database/database.module';
import {UsersModule} from './users/users.module';
import {MailModule} from './mail/mail.module';
import {JwtModule} from './jwt/jwt.module';
import {JwtMiddleware} from './jwt/jwt.middleware';
import {environments} from './config/environments';
import {schema} from './config/schema-validation';
import {RestaurantsModule} from './restaurants/restaurants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: environments[process.env.NODE_ENV] || '.env.dev',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: schema,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: ({req}) => ({user: req['user']}),
    }),
    JwtModule.forRoot({secretKey: process.env.SECRET_KEY}),
    DatabaseModule,
    MailModule,
    UsersModule,
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.POST,
    });
  }
}
