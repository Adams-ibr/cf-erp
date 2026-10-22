import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { AccountsController } from './accounts/accounts.controller';
import { JournalEntriesController } from './journal-entries/journal-entries.controller';
import { LedgersController } from './ledgers/ledgers.controller';
import { TrialBalanceController } from './trial-balance/trial-balance.controller';
import { FinancialStatementsController } from './financial-statements/financial-statements.controller';
import { BudgetsController } from './budgets/budgets.controller';
import { CostCentersController } from './cost-centers/cost-centers.controller';
import { ProfitCentersController } from './profit-centers/profit-centers.controller';
import { FixedAssetsController } from './fixed-assets/fixed-assets.controller';
import { TaxController } from './tax/tax.controller';
import { ReconciliationController } from './reconciliation/reconciliation.controller';
import { ClosingController } from './closing/closing.controller';
import { AccountsService } from './accounts/accounts.service';
import { JournalEntriesService } from './journal-entries/journal-entries.service';
import { LedgersService } from './ledgers/ledgers.service';
import { TrialBalanceService } from './trial-balance/trial-balance.service';
import { FinancialStatementsService } from './financial-statements/financial-statements.service';
import { BudgetsService } from './budgets/budgets.service';
import { CostCentersService } from './cost-centers/cost-centers.service';
import { ProfitCentersService } from './profit-centers/profit-centers.service';
import { FixedAssetsService } from './fixed-assets/fixed-assets.service';
import { TaxService } from './tax/tax.service';
import { ReconciliationService } from './reconciliation/reconciliation.service';
import { ClosingService } from './closing/closing.service';
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
    ScheduleModule.forRoot(),
    AuthModule,
    DatabaseModule,
    MessagingModule,
    PrismaModule,
  ],
  controllers: [
    AccountsController,
    JournalEntriesController,
    LedgersController,
    TrialBalanceController,
    FinancialStatementsController,
    BudgetsController,
    CostCentersController,
    ProfitCentersController,
    FixedAssetsController,
    TaxController,
    ReconciliationController,
    ClosingController,
    HealthController,
  ],
  providers: [
    AccountsService,
    JournalEntriesService,
    LedgersService,
    TrialBalanceService,
    FinancialStatementsService,
    BudgetsService,
    CostCentersService,
    ProfitCentersService,
    FixedAssetsService,
    TaxService,
    ReconciliationService,
    ClosingService,
  ],
})
export class AppModule {}