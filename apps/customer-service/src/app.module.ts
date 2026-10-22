import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { CustomersController } from './customers/customers.controller';
import { SuppliersController } from './suppliers/suppliers.controller';
import { ContactsController } from './contacts/contacts.controller';
import { AddressesController } from './addresses/addresses.controller';
import { CustomersService } from './customers/customers.service';
import { SuppliersService } from './suppliers/suppliers.service';
import { ContactsService } from './contacts/contacts.service';
import { AddressesService } from './addresses/addresses.service';
import { BankDetailsService } from './bank-details/bank-details.service';
import { ActivitiesService } from './activities/activities.service';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      envFilePath: ['.env', `.env.${env.nodeEnv}`],
    }),
    ThrottlerModule.forRoot([{
      ttl: env.rateLimit.windowMs,
      limit: env.rateLimit.maxRequests,
    }]),
    TerminusModule,
    AuthModule,
    DatabaseModule,
    MessagingModule,
    PrismaModule,
  ],
  controllers: [
    CustomersController,
    SuppliersController,
    ContactsController,
    AddressesController,
    HealthController,
  ],
  providers: [
    CustomersService,
    SuppliersService,
    ContactsService,
    AddressesService,
    BankDetailsService,
    ActivitiesService,
  ],
})
export class AppModule {}