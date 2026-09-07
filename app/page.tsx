'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Heart,
  Loader2,
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
  Trash2,
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
type CartItem = Product & { quantity: number }

const TAX_RATE = 0.0875

const CART_STORAGE_KEY = 'aurelia-cart'
const FAVORITES_STORAGE_KEY = 'aurelia-favorites'

/**
 * Web3Forms access key. Referenced statically so Next can inline it at build
 * time; when it is unset both forms fall back to a local-only success state.
 */
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

const EMAIL_PATTERN = /^[^s@]+@[^s@]+.[^s@]+$/
const OPENING_TIME = '07:00'
const CLOSING_TIME = '21:00'

type StoredCartEntry = { name: string; quantity: number }
type FormStatus = 'idle' | 'sending' | 'sent' | 'error'

/** Local date as YYYY-MM-DD. Never derived on the server: this page is
 *  statically prerendered, so a build-time date would be stale on the client. */
function localToday() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function readStored<T>(key: string, isValid: (value: unknown) => value is T): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : null
  } catch {
    // Malformed JSON or blocked storage: fall back to a clean slate.
    return null
  }
}

function writeStored(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or private mode. Persistence is best effort.
  }
}

const isStoredCart = (value: unknown): value is StoredCartEntry[] =>
  Array.isArray(value) &&
  value.every(
    (entry) =>
      !!entry &&
      typeof entry === 'object' &&
      typeof (entry as StoredCartEntry).name === 'string' &&
      Number.isFinite((entry as StoredCartEntry).quantity) &&
      (entry as StoredCartEntry).quantity > 0,
  )

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string')

/** POSTs to Web3Forms. Resolves immediately when no key is configured so the
 *  demo keeps working without an account. */
async function sendToFormService(payload: Record<string, unknown>) {
  if (!WEB3FORMS_KEY) return
  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...payload }),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.success) {
    throw new Error(result?.message ?? 'Submission failed')
  }
}

const RESERVATION_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'time', label: 'Time', type: 'time' },
] as const

type ReservationField = (typeof RESERVATION_FIELDS)[number]['key']
type ReservationForm = Record<ReservationField | 'guests' | 'request', string>

const EMPTY_RESERVATION: ReservationForm = {
  name: '',
  email: '',
  date: '',
  time: '',
  guests: '2 guests',
  request: '',
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [favorites, setFavorites] = useState<string[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [today, setToday] = useState('')
  const [reservation, setReservation] = useState<ReservationForm>(EMPTY_RESERVATION)
  const [reservationErrors, setReservationErrors] = useState<Partial<ReservationForm>>({})
  const [reservationStatus, setReservationStatus] = useState<FormStatus>('idle')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState<FormStatus>('idle')
  const [search, setSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Restore persisted state on mount only, never during render (SSR safety).
  useEffect(() => {
    const storedCart = readStored(CART_STORAGE_KEY, isStoredCart)
    if (storedCart) {
      // Rebuild from the current product list so stale prices can't persist.
      setCart(
        storedCart.flatMap((entry) => {
          const product = products.find((item) => item.name === entry.name)
          return product ? [{ ...product, quantity: Math.floor(entry.quantity) }] : []
        }),
      )
    }
    const storedFavorites = readStored(FAVORITES_STORAGE_KEY, isStringArray)
    if (storedFavorites) {
      setFavorites(storedFavorites.filter((name) => products.some((item) => item.name === name)))
    }
    setToday(localToday())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeStored(
      CART_STORAGE_KEY,
      cart.map(({ name, quantity }) => ({ name, quantity })),
    )
  }, [cart, hydrated])

  useEffect(() => {
    if (!hydrated) return
    writeStored(FAVORITES_STORAGE_KEY, favorites)
  }, [favorites, hydrated])

  // Let both forms be reused after a successful send.
  useEffect(() => {
    if (reservationStatus !== 'sent') return
    const timer = window.setTimeout(() => setReservationStatus('idle'), 4000)
    return () => window.clearTimeout(timer)
  }, [reservationStatus])

  useEffect(() => {
    if (subscribeStatus !== 'sent') return
    const timer = window.setTimeout(() => setSubscribeStatus('idle'), 4000)
    return () => window.clearTimeout(timer)
  }, [subscribeStatus])

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
    setCart((current) =>
      current.some((item) => item.name === product.name)
        ? current.map((item) =>
            item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...current, { ...product, quantity: 1 }],
    )
    setOrderPlaced(false)
    setCartOpen(true)
  }

  const changeQuantity = (name: string, delta: number) => {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.name !== name) return [item]
        const quantity = item.quantity + delta
        return quantity < 1 ? [] : [{ ...item, quantity }]
      }),
    )
    setOrderPlaced(false)
  }

  const removeFromCart = (name: string) => {
    setCart((current) => current.filter((item) => item.name !== name))
    setOrderPlaced(false)
  }
  const toggleFavorite = (name: string) =>
    setFavorites((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]))

  const updateReservation = (key: keyof ReservationForm, value: string) => {
    setReservation((current) => ({ ...current, [key]: value }))
    setReservationErrors((current) => ({ ...current, [key]: undefined }))
    setReservationStatus('idle')
  }

  const validateReservation = (values: ReservationForm) => {
    const errors: Partial<ReservationForm> = {}
    if (values.name.trim().length < 2) errors.name = 'Please tell us your name.'
    if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address.'
    if (!values.date) errors.date = 'Choose a date.'
    else if (values.date < localToday()) errors.date = 'Please choose a future date.'
    if (!values.time) errors.time = 'Choose a time.'
    else if (values.time < OPENING_TIME || values.time > CLOSING_TIME) {
      errors.time = 'We are open 07:00 - 21:00.'
    } else if (values.date === localToday() && values.time <= new Date().toTimeString().slice(0, 5)) {
      errors.time = 'That time has already passed today.'
    }
    return errors
  }

  const submitReservation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors = validateReservation(reservation)
    setReservationErrors(errors)
    if (Object.keys(errors).length > 0) {
      setReservationStatus('idle')
      return
    }
    setReservationStatus('sending')
    try {
      await sendToFormService({
        subject: 'New AURELIA table reservation',
        from_name: 'AURELIA Coffee House',
        form: 'Reservation',
        name: reservation.name.trim(),
        email: reservation.email.trim(),
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guests,
        special_request: reservation.request.trim() || 'None',
      })
      setReservation(EMPTY_RESERVATION)
      setReservationStatus('sent')
    } catch {
      setReservationStatus('error')
    }
  }

  const submitSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError('Enter a valid email address.')
      setSubscribeStatus('idle')
      return
    }
    setEmailError('')
    setSubscribeStatus('sending')
    try {
      await sendToFormService({
        subject: 'New AURELIA newsletter signup',
        from_name: 'AURELIA Coffee House',
        form: 'Newsletter',
        email: email.trim(),
      })
      setEmail('')
      setSubscribeStatus('sent')
    } catch {
      setSubscribeStatus('error')
    }
  }

  const fieldClass = (error?: string) =>
    error ? 'field-input border-destructive focus:border-destructive focus:ring-destructive/20' : 'field-input'

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

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
              aria-label={`Open order, ${cartCount} items`}
            >
              <ShoppingBag size={17} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] text-accent-foreground">
                  {cartCount}
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
            noValidate
            onSubmit={submitReservation}
            className="card-surface grid gap-6 p-7 sm:grid-cols-2 sm:p-9"
          >
            {RESERVATION_FIELDS.map(({ key, label, type }) => (
              <label key={key} className="field-label">
                {label}
                <input
                  type={type}
                  value={reservation[key]}
                  onChange={(e) => updateReservation(key, e.target.value)}
                  min={type === 'date' ? today || undefined : type === 'time' ? OPENING_TIME : undefined}
                  max={type === 'time' ? CLOSING_TIME : undefined}
                  aria-invalid={Boolean(reservationErrors[key])}
                  className={fieldClass(reservationErrors[key])}
                />
                {reservationErrors[key] ? <FieldError message={reservationErrors[key]!} /> : null}
              </label>
            ))}
            <label className="field-label relative">
              Guests
              <select
                value={reservation.guests}
                onChange={(e) => updateReservation('guests', e.target.value)}
                className="field-input appearance-none"
              >
                <option>2 guests</option>
                <option>3 guests</option>
                <option>4 guests</option>
                <option>5+ guests</option>
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-3 right-3" size={16} />
            </label>
            <label className="field-label">
              Special request
              <input
                value={reservation.request}
                onChange={(e) => updateReservation('request', e.target.value)}
                className="field-input"
                placeholder="Optional"
              />
            </label>
            <button
              type="submit"
              disabled={reservationStatus === 'sending'}
              className="btn-primary sm:col-span-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {reservationStatus === 'sending' ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Sending
                </>
              ) : reservationStatus === 'sent' ? (
                <>
                  <Check size={15} /> Request received
                </>
              ) : (
                'Reserve your table'
              )}
            </button>
            <p className="text-xs leading-5 text-muted-foreground sm:col-span-2" role="status">
              {reservationStatus === 'error'
                ? 'Something went wrong sending your request. Please try again or call us.'
                : reservationStatus === 'sent'
                  ? 'Thank you. We will confirm your table by email shortly.'
                  : 'We hold tables for 15 minutes past the booking time.'}
            </p>
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
          noValidate
          onSubmit={submitSubscribe}
          className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-full border border-accent-foreground/30 bg-accent-foreground/5 px-5 py-2.5"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError('')
              setSubscribeStatus('idle')
            }}
            aria-invalid={Boolean(emailError)}
            aria-label="Email address"
            placeholder="Your email address"
            className="w-full bg-transparent text-sm outline-none placeholder:text-accent-foreground/60"
          />
          <button
            type="submit"
            disabled={subscribeStatus === 'sending'}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-accent-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-accent transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {subscribeStatus === 'sending' ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Sending
              </>
            ) : subscribeStatus === 'sent' ? (
              'Thank you'
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
        <p
          className="mx-auto mt-4 flex min-h-5 max-w-md items-center justify-center gap-1.5 text-xs text-accent-foreground/80"
          role="status"
        >
          {emailError ? (
            <>
              <AlertCircle size={13} /> {emailError}
            </>
          ) : subscribeStatus === 'error' ? (
            <>
              <AlertCircle size={13} /> That did not send. Please try again.
            </>
          ) : subscribeStatus === 'sent' ? (
            'You are on the list.'
          ) : null}
        </p>
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
                  The bag <span className="text-muted-foreground">({cartCount})</span>
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
                  {cart.map((item) => (
                    <div key={item.name} className="flex gap-4">
                      <img src={item.image} alt="" className="img-frame size-20 shrink-0 object-cover" />
                      <div className="flex-1">
                        <div className="flex justify-between gap-3">
                          <p className="font-serif text-lg">{item.name}</p>
                          <span className="text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} each &middot; Made to order
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs">
                          <button
                            onClick={() => changeQuantity(item.name, -1)}
                            className="rounded-full border border-border p-1 transition-colors hover:bg-muted"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus size={12} />
                          </button>
                          <span aria-live="polite">{item.quantity}</span>
                          <button
                            onClick={() => changeQuantity(item.name, 1)}
                            className="rounded-full border border-border p-1 transition-colors hover:bg-muted"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.name)}
                            className="ml-auto rounded-full border border-border p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label={`Remove ${item.name} from bag`}
                          >
                            <Trash2 size={12} />
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
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                  <span>Tax ({(TAX_RATE * 100).toFixed(2)}%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setOrderPlaced(true)}
                  disabled={orderPlaced}
                  className="btn-primary mt-5 w-full"
                >
                  {orderPlaced ? (
                    <>
                      <Check size={15} /> Order placed
                    </>
                  ) : (
                    <>
                      Continue to checkout <ArrowRight size={15} />
                    </>
                  )}
                </button>
                {orderPlaced && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Demo only &mdash; no payment was taken.
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  )
}

function FieldError({ message }: { message: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium normal-case tracking-normal text-destructive">
      <AlertCircle size={12} /> {message}
    </span>
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
