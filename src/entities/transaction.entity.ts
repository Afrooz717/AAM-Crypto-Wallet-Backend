import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Wallet } from './wallet.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive'
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 66, unique: true })
  hash: string;

  @Column({ type: 'varchar', length: 42 })
  fromAddress: string;

  @Column({ type: 'varchar', length: 42 })
  toAddress: string;

  @Column({ type: 'decimal', precision: 65, scale: 0 })
  value: string;

  @Column({ type: 'decimal', precision: 65, scale: 0, default: '0' })
  gasPrice: string;

  @Column({ type: 'int', default: 0 })
  gasLimit: number;

  @Column({ type: 'int', default: 0 })
  gasUsed: number;

  @Column({ type: 'int', nullable: true })
  blockNumber: number;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  note: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'json', nullable: true })
  transactionData: any;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column()
  walletId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date;
} 