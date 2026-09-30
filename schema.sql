-- =======================================================
-- GTA Korea (Geoje Taxpayers Association)
-- Database Schema Definition for PostgreSQL / Supabase / MySQL
-- =======================================================

-- 1. Users Table (회원가입 및 회원 관리)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  member_type VARCHAR(20) NOT NULL DEFAULT 'individual', -- 'individual' | 'corporate'
  biz_no VARCHAR(50),
  address TEXT,
  interest VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'member' | 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Consultations Table (1:1 온라인 세무 상담 접수)
CREATE TABLE IF NOT EXISTS consultations (
  id VARCHAR(64) PRIMARY KEY,
  applicant_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT '접수', -- '접수' | '진행중' | '완료'
  admin_memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Attachments Table (증빙 서류 파일 암호화 첨부)
CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  consultation_id VARCHAR(64) REFERENCES consultations(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  encrypted_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Notices Table (세무 자료실 & FAQ & 공지사항)
CREATE TABLE IF NOT EXISTS notices (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- '공지' | '세무자료' | 'FAQ'
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_consultations_phone ON consultations(phone);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
