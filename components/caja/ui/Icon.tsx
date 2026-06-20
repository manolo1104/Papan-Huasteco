import {
  Home,
  UtensilsCrossed,
  ChefHat,
  ReceiptText,
  Wallet,
  PartyPopper,
  ClipboardList,
  Package,
  CalendarDays,
  BarChart3,
  Settings,
  Banknote,
  CreditCard,
  Download,
  RefreshCw,
  Printer,
  MessageCircle,
  Paperclip,
  Check,
  Plus,
  AlertTriangle,
  ArrowLeft,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";

// Set único de íconos del panel (lucide-react), un solo grosor de trazo para
// mantener ritmo visual. Uso: <Icon name="home" /> · reemplaza a los emojis.
const MAP = {
  home: Home,
  pos: UtensilsCrossed,
  cocina: ChefHat,
  turnos: ReceiptText,
  gastos: Wallet,
  eventos: PartyPopper,
  productos: ClipboardList,
  inventario: Package,
  resumen: CalendarDays,
  reportes: BarChart3,
  ajustes: Settings,
  efectivo: Banknote,
  tarjeta: CreditCard,
  importar: Download,
  actualizar: RefreshCw,
  imprimir: Printer,
  whatsapp: MessageCircle,
  ticket: Paperclip,
  check: Check,
  nuevo: Plus,
  alerta: AlertTriangle,
  volver: ArrowLeft,
  cerrar: X,
  salir: LogOut,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof MAP;

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const C = MAP[name];
  return <C size={size} strokeWidth={1.75} className={className} aria-hidden />;
}
