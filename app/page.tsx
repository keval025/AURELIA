'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Heart,
  Mail,
  Menu,
  MapPin,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { Reveal } from '@/components/reveal'

const images = {
  hero: '/images/aurelia-hero.png',
  coffee: '/images/aurelia-coffee.png',
  pastry: '/images/aurelia-pastry.png',
  brunch: '/images/aurelia-brunch.png',
  gallery: '/images/aurelia-gallery.png',
}

const products = [
  {
    name: 'Signature Espresso',
    category: 'Coffee',
    price: 4.5,
    description: 'A bright, balanced house blend with notes of cacao.',
    image: images.coffee,
    tag: 'House classic',
    featured: true,
  },
  {
    name: 'Vanilla Bean Latte',
    category: 'Coffee',
    price: 6.5,
    description: 'Velvety espresso, steamed milk, and real vanilla bean.',
    image: images.coffee,
    tag: 'Most loved',
    featured: false,
  },
  {
    name: 'Jasmine Silver Needle',
    category: 'Tea',
    price: 5.5,
    description: 'Delicate white tea leaves with a whisper of jasmine blossom.',
    image: images.gallery,
    tag: 'Light & floral',
    featured: true,
  },
  {
    name: 'Spiced Chai Latte',
    category: 'Tea',
    price: 5.75,
    description: 'House-blended chai, steamed milk, and a dusting of cardamom.',
    image: images.gallery,
    tag: 'Warming',
    featured: false,
  },
  {
    name: 'AURELIA Breakfast',
    category: 'Breakfast',
    price: 14,
    description: 'Soft eggs, sourdough, greens, and seasonal preserves.',
    image: images.brunch,
    tag: 'Seasonal',
    featured: true,
  },
  {
    name: 'Pistachio Croissant',
    category: 'Bakery',
    price: 5.75,
    description: 'Twice-baked pastry with pistachio frangipane.',
    image: images.pastry,
    tag: 'Baked today',
    featured: true,
  },
  {
    name: 'Dark Chocolate Tart',
    category: 'Desserts',
    price: 7.5,
    description: 'Single-origin dark chocolate ganache in a shortcrust shell.',
    image: images.pastry,
    tag: 'Rich & silky',
    featured: false,
  },
  {
    name: 'Salted Caramel Financier',
    category: 'Desserts',
    price: 6,
    description: "Brown butter almond cake with a molten caramel center.",
    image: images.brunch,
    tag: "Baker's choice",
    featured: false,
  },
]
const categories = ['All', 'Coffee', 'Tea', 'Breakfast', 'Bakery', 'Desserts']
type Product = (typeof products)[number]

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [favorites, setFavorites] = useState<string[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reservationSent, setReservationSent] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [search, setSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const featuredProducts = useMemo(() => products.filter((product) => product.featured), [])
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          (activeCategory === 'All' || product.category === activeCategory) &&
          product.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [activeCategory, search],
  )

  const addToCart = (product: Product) => {
    setCart((current) => [...current, product])
    setCartOpen(true)
  }
  const toggleFavorite = (name: string) =>
    setFavorites((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]))

  const headerTone = scrolled ? 'text-foreground' : 'text-white'

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* ---------------------------------- Header ---------------------------------- */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-out ${headerTone} ${
          scrolled
            ? 'border-b border-border/70 bg-background/85 shadow-soft-sm backdrop-blur-md'
            : 'border-b border-white/15 bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 lg:px-10">
          <a href="#top" className="font-serif text-2xl tracking-[0.18em]">
            AURELIA
          </a>
          <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.18em] lg:flex" aria-label="Main navigation">
            <a href="#menu" className="nav-link">Menu</a>
            <a href="#story" className="nav-link">Our Story</a>
            <a href="#gallery" className="nav-link">Gallery</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className={`relative rounded-full border p-2.5 transition-all duration-300 hover:-translate-y-0.5 ${
                scrolled
                  ? 'border-foreground/20 hover:bg-foreground hover:text-background'
                  : 'border-white/40 hover:bg-white hover:text-foreground'
              }`}
              aria-label={`Open order, ${cart.length} items`}
            >
              <ShoppingBag size={17} />
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] text-accent-foreground">
                  {cart.length}
                </span>
              )}
            </button>
            <a
              href="#reserve"
              className={`hidden lg:inline-flex ${scrolled ? 'btn-accent' : 'btn-outline-invert'}`}
            >
              Reserve a Table
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`rounded-full border p-2.5 lg:hidden ${scrolled ? 'border-foreground/20' : 'border-white/40'}`}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="flex flex-col gap-5 border-t border-border/60 bg-background px-6 py-6 text-sm uppercase tracking-[0.14em] text-foreground lg:hidden">
            <a href="#menu" onClick={() => setMenuOpen(false)}>Menu</a>
            <a href="#story" onClick={() => setMenuOpen(false)}>Our Story</a>
            <a href="#gallery" onClick={() => setMenuOpen(false)}>Gallery</a>
            <a href="#reserve" onClick={() => setMenuOpen(false)}>Reserve a Table</a>
          </nav>
        )}
      </header>

      {/* ---------------------------------- Hero ---------------------------------- */}
      <section
        id="top"
        className="relative flex min-h-[720px] items-end bg-cover bg-center px-5 pb-14 pt-32 text-white lg:min-h-[880px] lg:px-10 lg:pb-24"
        style={{
          backgroundImage: `linear-gradient(100deg, rgba(18,13,10,.82), rgba(18,13,10,.28)), url(${images.hero})`,
        }}
      >
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow mb-7 text-white/75">Specialty coffee &middot; Since 2018</p>
            <h1 className="max-w-4xl font-serif text-6xl leading-[.92] tracking-[-0.02em] sm:text-8xl lg:text-[9rem]">
              Crafted Slowly.
              <br />
              <em className="text-[#d9b96a] not-italic">Enjoyed Fully.</em>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-white/80">
              Specialty coffee, seasonal plates, and quiet moments in the heart of the city.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#menu" className="btn-accent">
                Explore Menu <ArrowRight size={15} />
              </a>
              <a href="#reserve" className="btn-outline-invert">
                Reserve a Table
              </a>
            </div>
          </div>
          <div className="hidden border-l border-white/30 pl-6 text-xs leading-relaxed text-white/75 md:block">
            <span className="mb-2 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#d9b96a]" /> Open daily
            </span>
            07:00 &mdash; 21:00
            <br />
            <br />
            14 Mercer Street
            <br />
            New York, NY
          </div>
        </div>
      </section>

      {/* ---------------------------------- Daily edit ---------------------------------- */}
      <Reveal as="section" className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10 lg:py-32">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The daily edit</p>
            <h2 className="section-title mt-3">
              Made for your
              <br />
              <em>daily ritual.</em>
            </h2>
          </div>
          <a href="#menu" className="nav-link hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] md:flex">
            View full menu <ArrowRight size={16} />
          </a>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.name}
              product={product}
              favorite={favorites.includes(product.name)}
              onFavorite={() => toggleFavorite(product.name)}
              onAdd={() => addToCart(product)}
            />
          ))}
        </div>
      </Reveal>

      {/* ---------------------------------- Story ---------------------------------- */}
      <Reveal as="section" id="story" className="bg-secondary">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-24 lg:px-10 lg:py-32">
          <div className="relative">
            <img
              src={images.gallery}
              alt="Warmly lit AURELIA cafe interior"
              className="img-frame aspect-[4/5] w-full object-cover shadow-soft-lg"
            />
            <div className="absolute -bottom-6 -right-3 rounded-2xl bg-accent px-5 py-4 text-xs uppercase tracking-[0.14em] text-accent-foreground shadow-soft-lg lg:-right-8">
              <span className="font-serif text-2xl">01</span> / 04
              <br />
              The space
            </div>
          </div>
          <div className="max-w-xl">
            <p className="eyebrow">Our point of view</p>
            <h2 className="section-title mt-3">
              Coffee with a
              <br />
              <em>point of view.</em>
            </h2>
            <p className="mt-8 text-base leading-8 text-muted-foreground">
              AURELIA is a neighborhood coffee house built around the belief that the everyday deserves attention. We
              source expressive beans, partner with local producers, and make every plate and pour with intention.
            </p>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Come for the coffee. Stay for the feeling of having nowhere else to be.
            </p>
            <a href="#gallery" className="nav-link mt-9 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-accent-deep">
              Discover our story <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </Reveal>

      {/* ---------------------------------- Ritual mosaic ---------------------------------- */}
      <Reveal as="section" className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-5 lg:grid-cols-12">
          <div
            className="img-frame relative min-h-[520px] bg-cover bg-center shadow-soft lg:col-span-7"
            style={{ backgroundImage: `url(${images.coffee})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
            <div className="absolute bottom-7 left-7 text-white">
              <p className="eyebrow text-white/70">01 &middot; Morning</p>
              <h3 className="font-serif text-5xl">Begin gently.</h3>
            </div>
          </div>
          <div className="grid gap-5 lg:col-span-5">
            <div
              className="img-frame relative min-h-[250px] bg-cover bg-center shadow-soft"
              style={{ backgroundImage: `url(${images.pastry})` }}
            >
              <div className="absolute inset-0 bg-foreground/35" />
              <h3 className="absolute bottom-6 left-6 font-serif text-4xl text-white">Roasted with care.</h3>
            </div>
            <div className="flex min-h-[250px] flex-col justify-between rounded-3xl bg-accent p-7 text-accent-foreground shadow-soft">
              <Sparkles size={22} />
              <div>
                <p className="eyebrow text-accent-foreground/70">The AURELIA experience</p>
                <h3 className="font-serif text-4xl leading-tight">
                  A little more
                  <br />
                  <em>beautiful.</em>
                </h3>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ---------------------------------- Menu ---------------------------------- */}
      <Reveal as="section" id="menu" className="bg-foreground text-background">
        <div className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10 lg:py-32">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-[#d9b96a]">From the counter</p>
              <h2 className="section-title mt-3">The menu.</h2>
            </div>
            <div className="relative flex items-center rounded-full border border-background/25 bg-background/5 px-4 py-3 md:w-72">
              <Search size={16} className="mr-3 shrink-0 text-background/60" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the menu"
                className="w-full bg-transparent text-sm outline-none placeholder:text-background/45"
                aria-label="Search menu"
              />
            </div>
          </div>
          <div className="my-10 flex gap-2 overflow-x-auto border-y border-background/15 py-5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.12em] transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-accent text-accent-foreground shadow-soft'
                    : 'text-background/65 hover:bg-background/10 hover:text-background'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.name}
                product={product}
                dark
                favorite={favorites.includes(product.name)}
                onFavorite={() => toggleFavorite(product.name)}
                onAdd={() => addToCart(product)}
              />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <p className="py-16 text-center text-background/60">Nothing on the menu matches that search.</p>
          )}
        </div>
      </Reveal>

      {/* ---------------------------------- Gallery ---------------------------------- */}
      <Reveal as="section" id="gallery" className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10 lg:py-32">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="eyebrow">A place to linger</p>
            <h2 className="section-title mt-3">
              Inside
              <br />
              <em>AURELIA.</em>
            </h2>
          </div>
          <p className="hidden max-w-xs text-sm leading-7 text-muted-foreground md:block">
            A cafe for first dates, last pages, and the space between.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
          <img
            src={images.gallery}
            alt="Friends enjoying coffee together"
            className="img-frame aspect-square w-full object-cover shadow-soft md:col-span-2 md:row-span-2 md:aspect-auto"
          />
          <img
            src={images.coffee}
            alt="Latte art in a ceramic cup"
            className="img-frame aspect-square w-full object-cover shadow-soft"
          />
          <img
            src={images.pastry}
            alt="Fresh pastries on a counter"
            className="img-frame aspect-square w-full object-cover shadow-soft"
          />
          <img
            src={images.brunch}
            alt="AURELIA seasonal breakfast plate"
            className="img-frame aspect-square w-full object-cover shadow-soft"
          />
          <div className="flex aspect-square flex-col justify-between rounded-3xl bg-accent p-5 text-accent-foreground shadow-soft md:p-7">
            <Star size={20} fill="currentColor" />
            <p className="font-serif text-2xl leading-tight">&ldquo;Every detail feels intentional.&rdquo;</p>
            <span className="text-xs uppercase tracking-[0.14em]">&mdash; Sofia R.</span>
          </div>
        </div>
      </Reveal>

      {/* ---------------------------------- Reserve ---------------------------------- */}
      <Reveal as="section" id="reserve" className="bg-secondary">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-24 lg:grid-cols-[.8fr_1.2fr] lg:gap-24 lg:px-10 lg:py-32">
          <div>
            <p className="eyebrow">Make a moment of it</p>
            <h2 className="section-title mt-3">
              Reserve
              <br />
              <em>your table.</em>
            </h2>
            <p className="mt-7 max-w-sm leading-7 text-muted-foreground">
              Whether it is a quiet breakfast or a long overdue catch-up, we will keep a seat warm for you.
            </p>
            <div className="mt-10 space-y-3 text-sm leading-7 text-muted-foreground">
              <p className="flex items-center gap-3"><MapPin size={16} className="text-accent-deep" /> 14 Mercer Street, New York</p>
              <p className="flex items-center gap-3"><Clock size={16} className="text-accent-deep" /> Monday &mdash; Sunday, 07:00 &mdash; 21:00</p>
              <p className="flex items-center gap-3"><Phone size={16} className="text-accent-deep" /> +1 212 555 0148</p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setReservationSent(true)
            }}
            className="card-surface grid gap-6 p-7 sm:grid-cols-2 sm:p-9"
          >
            {['Name', 'Email', 'Date', 'Time'].map((label) => (
              <label key={label} className="field-label">
                {label}
                <input
                  required
                  type={label === 'Email' ? 'email' : label === 'Date' ? 'date' : label === 'Time' ? 'time' : 'text'}
                  className="field-input"
                />
              </label>
            ))}
            <label className="field-label relative">
              Guests
              <select className="field-input appearance-none">
                <option>2 guests</option>
                <option>3 guests</option>
                <option>4 guests</option>
                <option>5+ guests</option>
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-3 right-3" size={16} />
            </label>
            <label className="field-label">
              Special request
              <input className="field-input" placeholder="Optional" />
            </label>
            <button className="btn-primary sm:col-span-2">
              {reservationSent ? (
                <>
                  <Check size={15} /> Request received
                </>
              ) : (
                'Reserve your table'
              )}
            </button>
          </form>
        </div>
      </Reveal>

      {/* ---------------------------------- Newsletter ---------------------------------- */}
      <Reveal as="section" className="bg-accent px-5 py-20 text-center text-accent-foreground lg:px-10">
        <p className="eyebrow text-accent-foreground/70">A note from the house</p>
        <h2 className="mx-auto mt-3 max-w-2xl font-serif text-5xl leading-[.95] tracking-tight sm:text-7xl">
          Stay in the
          <br />
          <em>AURELIA circle.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-accent-foreground/75">
          Seasonal menus, new beans, and good things worth knowing.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubscribed(true)
          }}
          className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-full border border-accent-foreground/30 bg-accent-foreground/5 px-5 py-2.5"
        >
          <input
            required
            type="email"
            placeholder="Your email address"
            className="w-full bg-transparent text-sm outline-none placeholder:text-accent-foreground/60"
          />
          <button className="shrink-0 whitespace-nowrap rounded-full bg-accent-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-accent transition-all duration-300 hover:-translate-y-0.5">
            {subscribed ? 'Thank you' : 'Subscribe'}
          </button>
        </form>
      </Reveal>

      {/* ---------------------------------- Footer ---------------------------------- */}
      <Reveal as="footer" id="contact" className="bg-foreground px-5 pb-8 pt-16 text-background lg:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-serif text-3xl tracking-[0.18em]">AURELIA</div>
            <p className="mt-5 max-w-xs text-sm leading-7 text-background/60">
              A neighborhood coffee house for exceptional coffee, good food, and unhurried moments.
            </p>
            <div className="mt-7 flex gap-5 text-xs font-semibold uppercase tracking-[0.14em] text-background/70">
              <a href="#top" className="nav-link">Instagram</a>
              <a href="#top" className="nav-link">Pinterest</a>
            </div>
          </div>
          <div>
            <p className="eyebrow text-[#d9b96a]">Explore</p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-background/70">
              <a href="#menu" className="nav-link w-fit">Menu</a>
              <a href="#story" className="nav-link w-fit">Our Story</a>
              <a href="#gallery" className="nav-link w-fit">Gallery</a>
              <a href="#reserve" className="nav-link w-fit">Reservations</a>
            </div>
          </div>
          <div>
            <p className="eyebrow text-[#d9b96a]">Find us</p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-background/70">
              <p className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-[#d9b96a]" /> 14 Mercer Street<br />New York, NY 10013</p>
              <p className="flex items-center gap-3"><Mail size={16} className="shrink-0 text-[#d9b96a]" /> hello@aurelia.coffee</p>
              <p className="flex items-center gap-3"><Phone size={16} className="shrink-0 text-[#d9b96a]" /> +1 212 555 0148</p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-14 flex max-w-[1400px] flex-col gap-3 border-t border-background/15 pt-6 text-xs text-background/40 sm:flex-row sm:justify-between">
          <span>&copy; 2024 AURELIA Coffee House</span>
          <span>Privacy &middot; Terms</span>
        </div>
      </Reveal>

      {/* ---------------------------------- Cart drawer ---------------------------------- */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background p-6 text-foreground shadow-soft-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div>
                <p className="eyebrow">Your order</p>
                <h2 className="font-serif text-3xl">
                  The bag <span className="text-muted-foreground">({cart.length})</span>
                </h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-full border border-border p-2 transition-colors hover:bg-muted"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto py-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-4 text-muted-foreground" size={32} />
                  <p className="font-serif text-2xl">Your bag is waiting.</p>
                  <p className="mt-2 text-sm text-muted-foreground">Add something delicious from the menu.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {cart.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex gap-4">
                      <img src={item.image} alt="" className="img-frame size-20 shrink-0 object-cover" />
                      <div className="flex-1">
                        <div className="flex justify-between gap-3">
                          <p className="font-serif text-lg">{item.name}</p>
                          <span className="text-sm">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Regular &middot; Made to order</p>
                        <div className="mt-3 flex items-center gap-3 text-xs">
                          <button className="rounded-full border border-border p-1 transition-colors hover:bg-muted" aria-label="Decrease quantity">
                            <Minus size={12} />
                          </button>
                          <span>1</span>
                          <button className="rounded-full border border-border p-1 transition-colors hover:bg-muted" aria-label="Increase quantity">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-border pt-5">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                </div>
                <button className="btn-primary mt-5 w-full">
                  Continue to checkout <ArrowRight size={15} />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  )
}

function ProductCard({
  product,
  favorite,
  onFavorite,
  onAdd,
  dark = false,
}: {
  product: Product
  favorite: boolean
  onFavorite: () => void
  onAdd: () => void
  dark?: boolean
}) {
  return (
    <article className={`card-surface group overflow-hidden ${dark ? 'bg-background/5' : ''}`}>
      <div className="relative overflow-hidden rounded-t-3xl">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-[.9] w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-foreground shadow-soft-sm">
          {product.tag}
        </span>
        <button
          onClick={onFavorite}
          className="absolute right-4 top-4 rounded-full bg-background/90 p-2.5 text-foreground shadow-soft-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground"
          aria-label={`${favorite ? 'Remove' : 'Add'} ${product.name} ${favorite ? 'from' : 'to'} favorites`}
        >
          <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="p-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-serif text-2xl ${dark ? 'text-background' : ''}`}>{product.name}</h3>
          <span className={`pt-1 text-sm ${dark ? 'text-background/80' : 'text-muted-foreground'}`}>
            ${product.price.toFixed(2)}
          </span>
        </div>
        <p className={`mt-2 text-sm leading-6 ${dark ? 'text-background/55' : 'text-muted-foreground'}`}>
          {product.description}
        </p>
        <button
          onClick={onAdd}
          className={`nav-link mt-4 flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] ${
            dark ? 'text-[#d9b96a]' : 'text-accent-deep'
          }`}
        >
          Add to order <Plus size={15} />
        </button>
      </div>
    </article>
  )
}
