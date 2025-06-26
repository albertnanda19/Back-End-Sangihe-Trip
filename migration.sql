-- Sangihe Trip Database Schema
-- PostgreSQL Version

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_type_enum AS ENUM ('tourist', 'guide', 'admin', 'business_owner');
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'banned', 'pending');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE destination_status_enum AS ENUM ('active', 'inactive', 'pending', 'rejected');
CREATE TYPE destination_category_enum AS ENUM ('nature', 'cultural', 'adventure', 'religious', 'historical', 'culinary', 'beach', 'mountain');
CREATE TYPE image_type_enum AS ENUM ('main', 'gallery', 'thumbnail', 'banner');
CREATE TYPE review_status_enum AS ENUM ('active', 'pending', 'hidden', 'rejected');
CREATE TYPE trip_type_enum AS ENUM ('solo', 'couple', 'family', 'group', 'business');
CREATE TYPE trip_status_enum AS ENUM ('planning', 'confirmed', 'ongoing', 'completed', 'cancelled');
CREATE TYPE privacy_level_enum AS ENUM ('public', 'private', 'friends_only');
CREATE TYPE item_type_enum AS ENUM ('destination', 'restaurant', 'hotel', 'transport', 'activity', 'other');
CREATE TYPE note_type_enum AS ENUM ('general', 'important', 'reminder', 'expense', 'contact');
CREATE TYPE collaborator_role_enum AS ENUM ('owner', 'editor', 'viewer');
CREATE TYPE collaborator_status_enum AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE article_status_enum AS ENUM ('draft', 'published', 'archived', 'deleted');
CREATE TYPE article_category_enum AS ENUM ('travel_tips', 'destination_guide', 'culture', 'food', 'adventure', 'news');
CREATE TYPE report_reason_enum AS ENUM ('spam', 'inappropriate', 'fake', 'offensive', 'copyright');
CREATE TYPE report_status_enum AS ENUM ('pending', 'resolved', 'dismissed');
CREATE TYPE usage_type_enum AS ENUM ('profile_avatar', 'destination_image', 'review_image', 'article_image', 'other');

-- USER MANAGEMENT TABLES

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    bio TEXT,
    avatar_url VARCHAR(500),
    gender gender_enum,
    user_type user_type_enum DEFAULT 'tourist',
    status user_status_enum DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    preferences JSONB DEFAULT '{}',
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Indonesia',
    nationality VARCHAR(100),
    occupation VARCHAR(100),
    emergency_contact TEXT,
    travel_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info TEXT,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROLE & PERMISSION MANAGEMENT TABLES

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- DESTINATIONS & LOCATIONS TABLES

CREATE TABLE destination_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE destination_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(100),
    description TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    opening_hours TEXT,
    entry_fee DECIMAL(10, 2) DEFAULT 0,
    status destination_status_enum DEFAULT 'pending',
    category destination_category_enum,
    facilities JSONB DEFAULT '[]',
    contact_info JSONB DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE destination_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    caption TEXT,
    image_type image_type_enum DEFAULT 'gallery',
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE destination_facility_pivot (
    destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES destination_facilities(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (destination_id, facility_id)
);

-- REVIEWS & RATINGS TABLES

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT NOT NULL,
    pros_cons JSONB DEFAULT '{}',
    visit_date DATE,
    status review_status_enum DEFAULT 'pending',
    helpful_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    moderated_by UUID REFERENCES users(id),
    moderation_notes TEXT,
    moderated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(user_id, destination_id)
);

CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_helpful (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id)
);

CREATE TABLE review_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason report_reason_enum NOT NULL,
    description TEXT,
    status report_status_enum DEFAULT 'pending',
    handled_by UUID REFERENCES users(id),
    admin_notes TEXT,
    handled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TRIP PLANNING TABLES

CREATE TABLE trip_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    duration_days INTEGER,
    total_people INTEGER DEFAULT 1,
    trip_type trip_type_enum DEFAULT 'solo',
    estimated_budget DECIMAL(12, 2) DEFAULT 0,
    actual_budget DECIMAL(12, 2) DEFAULT 0,
    status trip_status_enum DEFAULT 'planning',
    privacy_level privacy_level_enum DEFAULT 'private',
    settings JSONB DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    clone_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE trip_plan_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_plan_id UUID NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE,
    title VARCHAR(255),
    description TEXT,
    daily_budget DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_plan_id, day_number)
);

CREATE TABLE trip_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_plan_day_id UUID NOT NULL REFERENCES trip_plan_days(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES destinations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,
    estimated_cost DECIMAL(10, 2) DEFAULT 0,
    actual_cost DECIMAL(10, 2) DEFAULT 0,
    item_type item_type_enum DEFAULT 'destination',
    sort_order INTEGER DEFAULT 0,
    custom_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_plan_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_plan_id UUID NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    note_type note_type_enum DEFAULT 'general',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_plan_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_plan_id UUID NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role collaborator_role_enum DEFAULT 'viewer',
    status collaborator_status_enum DEFAULT 'pending',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_plan_id, user_id)
);

-- CONTENT MANAGEMENT TABLES

CREATE TABLE article_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE article_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    meta_description TEXT,
    meta_keywords JSONB DEFAULT '[]',
    featured_image VARCHAR(500),
    status article_status_enum DEFAULT 'draft',
    category article_category_enum,
    view_count INTEGER DEFAULT 0,
    read_time_minutes INTEGER DEFAULT 5,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    published_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE article_tag_pivot (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES article_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (article_id, tag_id)
);

-- SYSTEM & ANALYTICS TABLES

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    model_type VARCHAR(100),
    model_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    event_data JSONB DEFAULT '{}',
    page_url VARCHAR(500),
    referrer VARCHAR(500),
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    page_type VARCHAR(50) NOT NULL,
    page_id VARCHAR(255),
    url VARCHAR(500) NOT NULL,
    referrer VARCHAR(500),
    session_duration INTEGER DEFAULT 0,
    device_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS TABLES

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type)
);

-- MEDIA MANAGEMENT TABLES

CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by UUID REFERENCES users(id),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    usage_type usage_type_enum DEFAULT 'other',
    alt_text VARCHAR(255),
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEARCH & RECOMMENDATIONS TABLES

CREATE TABLE search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    query VARCHAR(255) NOT NULL,
    filters VARCHAR(500),
    results_count INTEGER DEFAULT 0,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    favoritable_type VARCHAR(50) NOT NULL,
    favoritable_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, favoritable_type, favoritable_id)
);

-- CREATE INDEXES FOR PERFORMANCE

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Destinations indexes
CREATE INDEX idx_destinations_slug ON destinations(slug);
CREATE INDEX idx_destinations_status ON destinations(status);
CREATE INDEX idx_destinations_category ON destinations(category);
CREATE INDEX idx_destinations_location ON destinations(latitude, longitude);
CREATE INDEX idx_destinations_rating ON destinations(avg_rating);
CREATE INDEX idx_destinations_created_by ON destinations(created_by);
CREATE INDEX idx_destinations_is_featured ON destinations(is_featured);

-- Reviews indexes
CREATE INDEX idx_reviews_destination_id ON reviews(destination_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

-- Trip plans indexes
CREATE INDEX idx_trip_plans_user_id ON trip_plans(user_id);
CREATE INDEX idx_trip_plans_status ON trip_plans(status);
CREATE INDEX idx_trip_plans_privacy_level ON trip_plans(privacy_level);
CREATE INDEX idx_trip_plans_start_date ON trip_plans(start_date);

-- Articles indexes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_is_featured ON articles(is_featured);

-- Analytics indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_page_views_created_at ON page_views(created_at);

-- Role indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Full-text search indexes
CREATE INDEX idx_destinations_search ON destinations USING GIN (to_tsvector('indonesian', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_articles_search ON articles USING GIN (to_tsvector('indonesian', title || ' ' || COALESCE(content, '')));

-- CREATE TRIGGERS FOR AUTOMATIC UPDATED_AT

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_destination_categories_updated_at BEFORE UPDATE ON destination_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_plans_updated_at BEFORE UPDATE ON trip_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_plan_days_updated_at BEFORE UPDATE ON trip_plan_days FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_plan_items_updated_at BEFORE UPDATE ON trip_plan_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_plan_notes_updated_at BEFORE UPDATE ON trip_plan_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE FUNCTIONS FOR RATING CALCULATION

CREATE OR REPLACE FUNCTION update_destination_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE destinations 
        SET 
            avg_rating = (
                SELECT ROUND(AVG(rating)::numeric, 2) 
                FROM reviews 
                WHERE destination_id = NEW.destination_id 
                AND status = 'active'
            ),
            total_reviews = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE destination_id = NEW.destination_id 
                AND status = 'active'
            )
        WHERE id = NEW.destination_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE destinations 
        SET 
            avg_rating = (
                SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) 
                FROM reviews 
                WHERE destination_id = OLD.destination_id 
                AND status = 'active'
            ),
            total_reviews = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE destination_id = OLD.destination_id 
                AND status = 'active'
            )
        WHERE id = OLD.destination_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_destination_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_destination_rating();

-- CREATE FUNCTION FOR HELPFUL COUNT UPDATE

CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE reviews 
        SET helpful_count = (
            SELECT COUNT(*) 
            FROM review_helpful 
            WHERE review_id = NEW.review_id 
            AND is_helpful = true
        )
        WHERE id = NEW.review_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE reviews 
        SET helpful_count = (
            SELECT COUNT(*) 
            FROM review_helpful 
            WHERE review_id = OLD.review_id 
            AND is_helpful = true
        )
        WHERE id = OLD.review_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_helpful_count
    AFTER INSERT OR UPDATE OR DELETE ON review_helpful
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- INSERT DEFAULT DATA

-- Insert default destination categories
INSERT INTO destination_categories (name, slug, description, icon, color, sort_order) VALUES
('Wisata Alam', 'wisata-alam', 'Destinasi wisata alam dan pantai', 'leaf', '#10B981', 1),
('Wisata Budaya', 'wisata-budaya', 'Destinasi wisata budaya dan sejarah', 'landmark', '#F59E0B', 2),
('Wisata Petualangan', 'wisata-petualangan', 'Destinasi untuk aktivitas petualangan', 'mountain', '#EF4444', 3),
('Wisata Religi', 'wisata-religi', 'Destinasi wisata religi dan spiritual', 'church', '#8B5CF6', 4),
('Wisata Kuliner', 'wisata-kuliner', 'Destinasi wisata kuliner dan makanan tradisional', 'utensils', '#F97316', 5);

-- Insert default facilities
INSERT INTO destination_facilities (name, icon, description, category) VALUES
('Parkir', 'car', 'Area parkir kendaraan', 'transport'),
('Toilet', 'wc', 'Fasilitas toilet umum', 'basic'),
('Mushola', 'mosque', 'Tempat ibadah', 'worship'),
('Warung Makan', 'restaurant', 'Tempat makan dan minum', 'food'),
('Penginapan', 'bed', 'Fasilitas menginap', 'accommodation'),
('Akses WiFi', 'wifi', 'Koneksi internet gratis', 'connectivity'),
('ATM', 'credit-card', 'Mesin ATM', 'financial'),
('Toko Souvenir', 'shopping-bag', 'Toko oleh-oleh', 'shopping');

-- Insert default article categories
INSERT INTO article_categories (name, slug, description, color, sort_order) VALUES
('Tips Perjalanan', 'tips-perjalanan', 'Tips dan panduan perjalanan', '#3B82F6', 1),
('Panduan Destinasi', 'panduan-destinasi', 'Panduan lengkap destinasi wisata', '#10B981', 2),
('Budaya Lokal', 'budaya-lokal', 'Artikel tentang budaya dan tradisi lokal', '#F59E0B', 3),
('Kuliner', 'kuliner', 'Review dan panduan kuliner', '#EF4444', 4),
('Berita Wisata', 'berita-wisata', 'Berita terkini dunia pariwisata', '#8B5CF6', 5);

-- Seed default roles
INSERT INTO roles (name, description) VALUES
    ('user',  'Pengguna biasa yang dapat mem-booking perjalanan'),
    ('admin', 'Administrator yang dapat menambah/kelola informasi perjalanan')
ON CONFLICT (name) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (key, value, type, description, is_public) VALUES
('site_name', 'Sangihe Trip', 'string', 'Nama website', true),
('site_description', 'Platform wisata terlengkap untuk Kepulauan Sangihe', 'string', 'Deskripsi website', true),
('contact_email', 'info@sangihetrip.com', 'email', 'Email kontak utama', true),
('contact_phone', '+62-812-3456-7890', 'string', 'Nomor telepon kontak', true),
('max_upload_size', '10485760', 'integer', 'Maksimal ukuran upload (bytes)', false),
('supported_image_types', '["jpg", "jpeg", "png", "webp"]', 'json', 'Tipe gambar yang didukung', false),
('default_pagination_limit', '20', 'integer', 'Limit default untuk pagination', false),
('review_moderation_enabled', 'true', 'boolean', 'Aktifkan moderasi review', false);
