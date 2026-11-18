import { Link } from 'react-router-dom';
import { CATEGORIES, categoryPath } from '../config/site';

/** Static "shop by category" row — four circular tiles that link to each category. */
export default function CategoryMarquee() {
  const items = CATEGORIES.map((c) => ({
    ...c,
    image: c.image || `/categories/${c.slug}.jpg`,
  }));

  return (
    <section aria-label="Shop by category" className="border-y border-ink/5 bg-cream-dark/60 py-10">
      <div className="container-page">
        <p className="eyebrow mb-8 text-center">Shop by category</p>
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
          {items.map((c) => (
            <Link key={c.slug} to={categoryPath(c.slug)} className="group flex flex-col items-center gap-3">
              <span className="relative h-24 w-24 overflow-hidden rounded-full bg-cream-dark ring-2 ring-gold/60 ring-offset-4 ring-offset-cream transition-all duration-500 group-hover:ring-burgundy sm:h-28 sm:w-28">
                {c.image && (
                  <img
                    src={c.image}
                    alt={c.collection}
                    className="h-full w-full object-cover object-[50%_30%] transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                )}
              </span>
              <span className="text-center text-sm font-medium text-ink transition-colors group-hover:text-burgundy">
                {c.collection}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
