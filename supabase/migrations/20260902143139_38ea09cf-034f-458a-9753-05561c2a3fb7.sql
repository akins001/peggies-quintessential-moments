CREATE OR REPLACE FUNCTION public.enforce_featured_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  IF NEW.featured AND NEW.active THEN
    IF TG_OP = 'UPDATE' AND OLD.featured AND OLD.active THEN
      RETURN NEW;
    END IF;

    SELECT count(*) INTO current_count
    FROM public.gallery_items
    WHERE featured = true AND active = true AND id <> NEW.id;

    IF current_count >= 8 THEN
      RAISE EXCEPTION 'FEATURED_LIMIT_REACHED'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gallery_items_featured_limit ON public.gallery_items;

CREATE TRIGGER gallery_items_featured_limit
BEFORE INSERT OR UPDATE ON public.gallery_items
FOR EACH ROW EXECUTE FUNCTION public.enforce_featured_limit();