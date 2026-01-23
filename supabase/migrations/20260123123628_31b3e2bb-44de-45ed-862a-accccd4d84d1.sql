-- Add length constraints to reviews table for content validation
ALTER TABLE reviews ADD CONSTRAINT review_content_length 
  CHECK (char_length(content) BETWEEN 10 AND 5000);

ALTER TABLE reviews ADD CONSTRAINT review_title_length 
  CHECK (title IS NULL OR char_length(title) <= 200);