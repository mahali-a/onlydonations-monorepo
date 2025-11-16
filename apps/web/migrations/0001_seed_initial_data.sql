-- Seed production data: Categories, Countries, and Currencies
-- Categories
INSERT INTO category (id, name, enabled, created_at, updated_at) VALUES
('medical', 'Medical', 1, unixepoch(), unixepoch()),
('memorial', 'Memorial', 1, unixepoch(), unixepoch()),
('emergency', 'Emergency', 1, unixepoch(), unixepoch()),
('nonprofit', 'Nonprofit', 1, unixepoch(), unixepoch()),
('education', 'Education', 1, unixepoch(), unixepoch()),
('animal', 'Animal', 1, unixepoch(), unixepoch()),
('environment', 'Environment', 1, unixepoch(), unixepoch()),
('business', 'Business', 1, unixepoch(), unixepoch()),
('community', 'Community', 1, unixepoch(), unixepoch()),
('competition', 'Competition', 1, unixepoch(), unixepoch()),
('creative', 'Creative', 1, unixepoch(), unixepoch()),
('event', 'Event', 1, unixepoch(), unixepoch()),
('faith', 'Faith', 1, unixepoch(), unixepoch()),
('family', 'Family', 1, unixepoch(), unixepoch()),
('sports', 'Sports', 1, unixepoch(), unixepoch()),
('travel', 'Travel', 1, unixepoch(), unixepoch()),
('volunteer', 'Volunteer', 1, unixepoch(), unixepoch()),
('wishes', 'Wishes', 1, unixepoch(), unixepoch());
--> statement-breakpoint
-- Currencies (must be inserted before countries due to foreign key)
INSERT INTO currencies (code, name, symbol, enabled, created_at, updated_at) VALUES
('GHS', 'Ghanaian Cedi', '₵', 1, unixepoch(), unixepoch());
--> statement-breakpoint
-- Countries
INSERT INTO countries (code, name, currency_code, enabled, created_at, updated_at) VALUES
('GH', 'Ghana', 'GHS', 1, unixepoch(), unixepoch());
