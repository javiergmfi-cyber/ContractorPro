-- Seed: Construction Spanglish and Portuguese glossary
-- Per architecture-spec.md Section 9.1-9.2

-- Spanish/Spanglish construction terms
insert into public.glossary_terms (term, standard_english, category, language) values
  -- Roofing
  ('rufa', 'Roof', 'roofing', 'es'),
  ('roofa', 'Roof', 'roofing', 'es'),
  ('trozas', 'Trusses', 'roofing', 'es'),
  ('tejas', 'Shingles', 'roofing', 'es'),
  ('canalon', 'Gutter', 'roofing', 'es'),
  ('canaleta', 'Gutter', 'roofing', 'es'),

  -- Drywall/Walls
  ('shirok', 'Drywall', 'drywall', 'es'),
  ('chirok', 'Drywall', 'drywall', 'es'),
  ('sheetrock', 'Drywall', 'drywall', 'es'),
  ('placa', 'Drywall', 'drywall', 'es'),
  ('tablaroca', 'Drywall', 'drywall', 'es'),
  ('yeso', 'Plaster', 'drywall', 'es'),
  ('mud', 'Joint Compound', 'drywall', 'es'),
  ('tape', 'Drywall Tape', 'drywall', 'es'),

  -- Framing
  ('freiming', 'Framing', 'framing', 'es'),
  ('framing', 'Framing', 'framing', 'es'),
  ('estud', 'Stud', 'framing', 'es'),
  ('studs', 'Studs', 'framing', 'es'),
  ('viga', 'Beam', 'framing', 'es'),
  ('joist', 'Joist', 'framing', 'es'),

  -- Plumbing
  ('liqueo', 'Leak', 'plumbing', 'es'),
  ('lique', 'Leak', 'plumbing', 'es'),
  ('tubo', 'Pipe', 'plumbing', 'es'),
  ('pipa', 'Pipe', 'plumbing', 'es'),
  ('llave', 'Faucet', 'plumbing', 'es'),
  ('faucet', 'Faucet', 'plumbing', 'es'),
  ('drenaje', 'Drain', 'plumbing', 'es'),
  ('drain', 'Drain', 'plumbing', 'es'),
  ('toilet', 'Toilet', 'plumbing', 'es'),
  ('inodoro', 'Toilet', 'plumbing', 'es'),
  ('water heater', 'Water Heater', 'plumbing', 'es'),
  ('calentador', 'Water Heater', 'plumbing', 'es'),

  -- Electrical
  ('breaker', 'Circuit Breaker', 'electrical', 'es'),
  ('brekera', 'Circuit Breaker', 'electrical', 'es'),
  ('outlet', 'Electrical Outlet', 'electrical', 'es'),
  ('enchufe', 'Electrical Outlet', 'electrical', 'es'),
  ('switch', 'Light Switch', 'electrical', 'es'),
  ('suiche', 'Light Switch', 'electrical', 'es'),
  ('wiring', 'Electrical Wiring', 'electrical', 'es'),
  ('cableado', 'Electrical Wiring', 'electrical', 'es'),
  ('panel', 'Electrical Panel', 'electrical', 'es'),

  -- Painting
  ('pintura', 'Paint', 'painting', 'es'),
  ('primer', 'Primer', 'painting', 'es'),
  ('brocha', 'Brush', 'painting', 'es'),
  ('rodillo', 'Roller', 'painting', 'es'),
  ('trim', 'Trim Work', 'painting', 'es'),
  ('moldura', 'Molding', 'painting', 'es'),

  -- Flooring
  ('carpeta', 'Carpet', 'flooring', 'es'),
  ('carpet', 'Carpet', 'flooring', 'es'),
  ('tile', 'Tile', 'flooring', 'es'),
  ('baldosa', 'Tile', 'flooring', 'es'),
  ('piso', 'Flooring', 'flooring', 'es'),
  ('hardwood', 'Hardwood Flooring', 'flooring', 'es'),
  ('laminate', 'Laminate Flooring', 'flooring', 'es'),
  ('vinyl', 'Vinyl Flooring', 'flooring', 'es'),

  -- HVAC
  ('aire', 'Air Conditioning', 'hvac', 'es'),
  ('AC', 'Air Conditioning', 'hvac', 'es'),
  ('furnace', 'Furnace', 'hvac', 'es'),
  ('calefaccion', 'Heating', 'hvac', 'es'),
  ('ducto', 'Duct', 'hvac', 'es'),
  ('vent', 'Vent', 'hvac', 'es'),

  -- General/Verbs (morphological adaptations)
  ('fixear', 'Repair', 'general', 'es'),
  ('fixeamos', 'Repaired', 'general', 'es'),
  ('instalamos', 'Installed', 'general', 'es'),
  ('instalar', 'Install', 'general', 'es'),
  ('removemos', 'Removed', 'general', 'es'),
  ('remover', 'Remove', 'general', 'es'),
  ('reemplazar', 'Replace', 'general', 'es'),
  ('limpiar', 'Clean', 'general', 'es'),
  ('reparar', 'Repair', 'general', 'es'),
  ('materiales', 'Materials', 'general', 'es'),
  ('labor', 'Labor', 'general', 'es'),
  ('mano de obra', 'Labor', 'general', 'es'),

  -- Landscaping
  ('yarda', 'Yard', 'landscaping', 'es'),
  ('cesped', 'Lawn', 'landscaping', 'es'),
  ('grass', 'Grass/Lawn', 'landscaping', 'es'),
  ('zacate', 'Grass/Lawn', 'landscaping', 'es'),
  ('cerca', 'Fence', 'landscaping', 'es'),
  ('fence', 'Fence', 'landscaping', 'es'),
  ('deck', 'Deck', 'landscaping', 'es'),
  ('patio', 'Patio', 'landscaping', 'es'),

  -- Concrete
  ('concreto', 'Concrete', 'concrete', 'es'),
  ('cemento', 'Cement', 'concrete', 'es'),
  ('slab', 'Concrete Slab', 'concrete', 'es'),
  ('losa', 'Concrete Slab', 'concrete', 'es'),
  ('sidewalk', 'Sidewalk', 'concrete', 'es'),
  ('banqueta', 'Sidewalk', 'concrete', 'es'),
  ('driveway', 'Driveway', 'concrete', 'es'),
  ('entrada', 'Driveway', 'concrete', 'es'),

  -- Rooms
  ('master bedroom', 'Master Bedroom', 'rooms', 'es'),
  ('recamara principal', 'Master Bedroom', 'rooms', 'es'),
  ('cocina', 'Kitchen', 'rooms', 'es'),
  ('kitchen', 'Kitchen', 'rooms', 'es'),
  ('bano', 'Bathroom', 'rooms', 'es'),
  ('bathroom', 'Bathroom', 'rooms', 'es'),
  ('sala', 'Living Room', 'rooms', 'es'),
  ('living room', 'Living Room', 'rooms', 'es'),
  ('garage', 'Garage', 'rooms', 'es'),
  ('sotano', 'Basement', 'rooms', 'es'),
  ('basement', 'Basement', 'rooms', 'es'),
  ('atico', 'Attic', 'rooms', 'es'),
  ('attic', 'Attic', 'rooms', 'es');

-- Portuguese/Portuñol construction terms
insert into public.glossary_terms (term, standard_english, category, language) values
  -- Roofing
  ('telhado', 'Roof', 'roofing', 'pt'),
  ('telha', 'Shingle/Tile', 'roofing', 'pt'),
  ('calha', 'Gutter', 'roofing', 'pt'),

  -- Drywall/Walls
  ('drywall', 'Drywall', 'drywall', 'pt'),
  ('gesso', 'Plaster/Drywall', 'drywall', 'pt'),
  ('parede', 'Wall', 'drywall', 'pt'),

  -- Plumbing
  ('vazamento', 'Leak', 'plumbing', 'pt'),
  ('cano', 'Pipe', 'plumbing', 'pt'),
  ('torneira', 'Faucet', 'plumbing', 'pt'),
  ('ralo', 'Drain', 'plumbing', 'pt'),
  ('vaso', 'Toilet', 'plumbing', 'pt'),
  ('aquecedor', 'Water Heater', 'plumbing', 'pt'),

  -- Electrical
  ('disjuntor', 'Circuit Breaker', 'electrical', 'pt'),
  ('tomada', 'Electrical Outlet', 'electrical', 'pt'),
  ('interruptor', 'Light Switch', 'electrical', 'pt'),
  ('fiacao', 'Wiring', 'electrical', 'pt'),

  -- Painting
  ('pintura', 'Paint/Painting', 'painting', 'pt'),
  ('tinta', 'Paint', 'painting', 'pt'),
  ('pincel', 'Brush', 'painting', 'pt'),
  ('rolo', 'Roller', 'painting', 'pt'),

  -- Flooring
  ('carpete', 'Carpet', 'flooring', 'pt'),
  ('piso', 'Floor/Flooring', 'flooring', 'pt'),
  ('azulejo', 'Tile', 'flooring', 'pt'),
  ('madeira', 'Hardwood', 'flooring', 'pt'),

  -- General
  ('consertar', 'Repair', 'general', 'pt'),
  ('consertamos', 'Repaired', 'general', 'pt'),
  ('instalar', 'Install', 'general', 'pt'),
  ('instalamos', 'Installed', 'general', 'pt'),
  ('remover', 'Remove', 'general', 'pt'),
  ('removemos', 'Removed', 'general', 'pt'),
  ('trocar', 'Replace', 'general', 'pt'),
  ('limpar', 'Clean', 'general', 'pt'),
  ('materiais', 'Materials', 'general', 'pt'),
  ('mao de obra', 'Labor', 'general', 'pt'),

  -- Landscaping
  ('quintal', 'Yard', 'landscaping', 'pt'),
  ('grama', 'Grass/Lawn', 'landscaping', 'pt'),
  ('cerca', 'Fence', 'landscaping', 'pt'),
  ('deck', 'Deck', 'landscaping', 'pt'),

  -- Rooms
  ('quarto principal', 'Master Bedroom', 'rooms', 'pt'),
  ('cozinha', 'Kitchen', 'rooms', 'pt'),
  ('banheiro', 'Bathroom', 'rooms', 'pt'),
  ('sala', 'Living Room', 'rooms', 'pt'),
  ('garagem', 'Garage', 'rooms', 'pt'),
  ('porao', 'Basement', 'rooms', 'pt');
