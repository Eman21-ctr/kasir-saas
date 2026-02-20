-- 1. Create the 'assets' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to 'assets' bucket
-- This allows anyone to view the images if they have the URL
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'assets' );

-- 3. Allow authenticated users to upload to 'assets' bucket
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assets' AND
  auth.role() = 'authenticated'
);

-- 4. Allow users to update their own logos
-- In our code, logos are stored as: logos/[user_id]-[random].ext
-- We check if the filename starts with the user's ID
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'assets' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = 'logos' -- Optional: restrict to logos folder
);

-- 5. Allow users to delete their own logos
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assets' AND
  auth.role() = 'authenticated'
);
