-- Update learning materials with correct content URLs for embedded content
UPDATE learning_materials 
SET content_url = 'https://www.youtube.com/embed/R6o_TVU65sI'
WHERE title = 'Concept Video' AND learning_style = 'visual';

UPDATE learning_materials 
SET content_url = 'https://drive.google.com/file/d/1lW4oH7FMDhmMcouykUVztvOWreMmbTu2/preview'  
WHERE title = 'Step-by-Step Examples' AND learning_style = 'universal';