import { createClient } from "@supabase/supabase-js";
import type {
  AdminRole,
  AdminUserRecord,
  MetaPixelSettings,
  ProductKind,
  OrderInput,
  OrderRecord,
  OrderStatus,
  ProductInput,
  ProductRecord,
  ProductWeightOption,
} from "@/types";
import { DEFAULT_PRODUCTS, PIXEL_SETTINGS_KEY } from "@/lib/constants";

const ORDER_TRASH_KEY = "order_trash";

const SUPABASE_URL = "https://oodlpererkbxhiuugbax.supabase.co";
const SUPABASE_KEY = "sb_publishable_Iy7vBnXW9i9wb-TkEBSuFw_mA-k0JSr";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export function createSecondarySupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function sanitizeWeightOptions(weightOptions: ProductWeightOption[]) {
  return weightOptions
    .map((option) => ({
      label: option.label.trim(),
      price: Number(option.price || 0),
      comparePrice: option.comparePrice ? Number(option.comparePrice) : undefined,
    }))
    .filter((option) => option.label && option.price > 0);
}

function serializeProduct(input: ProductInput, id?: string) {
  const weightOptions = sanitizeWeightOptions(input.weightOptions);
  const basePrice = weightOptions[0]?.price ?? 0;

  return {
    ...(id ? { id } : {}),
    product_type: input.productType,
    name: input.name.trim(),
    description: input.description.trim(),
    price: basePrice,
    compare_price: weightOptions[0]?.comparePrice ?? null,
    category: "femme",
    images: input.images.filter(Boolean),
    weight_prices: Object.fromEntries(weightOptions.map((option) => [option.label, option.price])),
    weight_compare_prices: Object.fromEntries(
      weightOptions
        .filter((option) => option.comparePrice && option.comparePrice > option.price)
        .map((option) => [option.label, option.comparePrice as number]),
    ),
    weights: weightOptions.map((option) => option.label),
    stock: Number(input.stock || 0),
    featured: input.featured,
    active: input.active,
  };
}

function parseWeightOptions(row: Record<string, unknown>): ProductWeightOption[] {
  const weights = Array.isArray(row.weights) ? row.weights.map(String) : [];
  const prices =
    row.weight_prices && typeof row.weight_prices === "object"
      ? (row.weight_prices as Record<string, unknown>)
      : {};
  const comparePrices =
    row.weight_compare_prices && typeof row.weight_compare_prices === "object"
      ? (row.weight_compare_prices as Record<string, unknown>)
      : {};

  const options = weights.map((label) => ({
    label,
    price: Number(prices[label] ?? row.price ?? 0),
    comparePrice: Number(comparePrices[label] ?? 0) || undefined,
  }));

  return options.filter((option) => option.label && option.price > 0);
}

function parseProduct(row: Record<string, unknown>): ProductRecord {
  return {
    id: String(row.id ?? ""),
    productType: String(row.product_type ?? "product") as ProductKind,
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    stock: Number(row.stock ?? 0),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    weightOptions: parseWeightOptions(row),
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function parseProductCard(row: Record<string, unknown>): ProductRecord {
  const firstImage = row.first_image ? String(row.first_image) : "";
  const secondImage = row.second_image ? String(row.second_image) : "";
  const images = [firstImage, secondImage].filter(Boolean);

  return {
    id: String(row.id ?? ""),
    productType: String(row.product_type ?? "product") as ProductKind,
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    images,
    stock: Number(row.stock ?? 0),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    weightOptions: parseWeightOptions(row),
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function parseOrder(row: Record<string, unknown>): OrderRecord {
  const shippingAddress =
    row.shipping_address && typeof row.shipping_address === "object"
      ? (row.shipping_address as OrderRecord["shippingAddress"])
      : { wilaya: "", address: "", deliveryMethod: "domicile" as const };

  return {
    id: String(row.id ?? ""),
    orderNumber: String(row.order_number ?? ""),
    customerName: String(row.customer_name ?? ""),
    customerPhone: String(row.customer_phone ?? ""),
    items: Array.isArray(row.items) ? (row.items as OrderRecord["items"]) : [],
    subtotal: Number(row.subtotal ?? 0),
    shipping: Number(row.shipping ?? 0),
    total: Number(row.total ?? 0),
    status: String(row.status ?? "pending") as OrderStatus,
    shippingAddress,
    paymentMethod: String(row.payment_method ?? "الدفع عند الاستلام"),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function parseAdminUser(row: Record<string, unknown>): AdminUserRecord {
  return {
    userId: String(row.user_id ?? ""),
    email: String(row.email ?? ""),
    role: String(row.role ?? "admin") as AdminRole,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function makeProductId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .concat(`-${Date.now().toString().slice(-5)}`);
}

function makeOrderNumber() {
  return `ATLAS-${Date.now().toString().slice(-8)}`;
}

export async function fetchPublicProducts(productType: ProductKind = "product") {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("product_type", productType)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  const products = (data ?? []).map((row) => parseProduct(row as Record<string, unknown>));
  return products;
}

export async function fetchPublicProductCards(productType: ProductKind = "product") {
  const { data, error } = await supabase
    .from("products_public_cards")
    .select("*")
    .eq("active", true)
    .eq("product_type", productType)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (!error && data) {
    return data.map((row) => parseProductCard(row as Record<string, unknown>));
  }

  return fetchPublicProducts(productType);
}

export async function fetchPublicProductById(id: string, productType: ProductKind = "product") {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("product_type", productType)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  return parseProduct(data as Record<string, unknown>);
}

export async function fetchAdminProducts(productType: ProductKind = "product") {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("product_type", productType)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => parseProduct(row as Record<string, unknown>));
}

export async function createProduct(input: ProductInput) {
  const payload = serializeProduct(input, makeProductId(input.name));
  const { data, error } = await supabase.from("products").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return parseProduct(data as Record<string, unknown>);
}

export async function updateProduct(id: string, input: ProductInput) {
  const payload = serializeProduct(input);
  const { data, error } = await supabase.from("products").update(payload).eq("id", id).select().single();

  if (error) throw new Error(error.message);
  return parseProduct(data as Record<string, unknown>);
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function seedDefaultProducts() {
  const payload = DEFAULT_PRODUCTS.map((product) =>
    serializeProduct(
      {
        productType: "product",
        name: product.name,
        description: product.description,
        images: product.images,
        stock: product.stock,
        featured: product.featured,
        active: product.active,
        weightOptions: product.weightOptions,
      },
      product.id,
    ),
  );

  const { error } = await supabase.from("products").upsert(payload);
  if (error) throw new Error(error.message);
}

export async function createOrder(input: OrderInput) {
  const payload = {
    order_number: makeOrderNumber(),
    customer_name: input.customerName,
    customer_email: "",
    customer_phone: input.customerPhone,
    items: input.items,
    subtotal: input.subtotal,
    shipping: input.shipping,
    total: input.total,
    status: "pending",
    shipping_address: input.shippingAddress,
    payment_method: input.paymentMethod,
  };

  const { data, error } = await supabase.from("orders").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return parseOrder(data as Record<string, unknown>);
}

export async function fetchOrders() {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => parseOrder(row as Record<string, unknown>));
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function readTrashBucket() {
  const { data, error } = await supabase.from("site_settings").select("value").eq("key", ORDER_TRASH_KEY).maybeSingle();

  if (error || !data?.value || typeof data.value !== "object") {
    return [] as OrderRecord[];
  }

  const items = (data.value as { items?: OrderRecord[] }).items;
  return Array.isArray(items) ? items : [];
}

async function writeTrashBucket(items: OrderRecord[]) {
  const { error } = await supabase.from("site_settings").upsert({
    key: ORDER_TRASH_KEY,
    value: { items },
  });

  if (error) throw new Error(error.message);
}

export async function fetchOrderTrash() {
  return readTrashBucket();
}

export async function moveOrderToTrash(order: OrderRecord) {
  const items = await readTrashBucket();
  const next = [order, ...items.filter((entry) => entry.id !== order.id)];
  await writeTrashBucket(next);
  await deleteOrder(order.id);
}

export async function restoreOrderFromTrash(order: OrderRecord) {
  const { error } = await supabase.from("orders").insert({
    id: order.id,
    order_number: order.orderNumber,
    customer_name: order.customerName,
    customer_email: "",
    customer_phone: order.customerPhone,
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    shipping_address: order.shippingAddress,
    payment_method: order.paymentMethod,
  });

  if (error) throw new Error(error.message);

  const items = await readTrashBucket();
  await writeTrashBucket(items.filter((entry) => entry.id !== order.id));
}

export async function deleteOrderFromTrash(id: string) {
  const items = await readTrashBucket();
  await writeTrashBucket(items.filter((entry) => entry.id !== id));
}

export async function fetchAdminUsers() {
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => parseAdminUser(row as Record<string, unknown>));
}

export async function createAdminUser(email: string, password: string, role: AdminRole) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
  }

  const { error } = await supabase.rpc("create_backoffice_user", {
    target_email: cleanEmail,
    target_password: cleanPassword,
    target_role: role,
  });

  if (error) throw new Error(error.message);
}

export async function updateAdminUserRole(userId: string, role: AdminRole) {
  const { error } = await supabase.from("admin_users").update({ role }).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function deleteAdminUser(userId: string) {
  const { error } = await supabase.from("admin_users").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function fetchMetaPixelSettings(): Promise<MetaPixelSettings> {
  const { data, error } = await supabase.from("site_settings").select("value").eq("key", PIXEL_SETTINGS_KEY).maybeSingle();

  if (error || !data?.value || typeof data.value !== "object") {
    return { enabled: false, pixelId: "" };
  }

  const value = data.value as Record<string, unknown>;
  return {
    enabled: Boolean(value.enabled),
    pixelId: String(value.pixelId ?? ""),
  };
}

export async function saveMetaPixelSettings(settings: MetaPixelSettings) {
  const { error } = await supabase.from("site_settings").upsert({
    key: PIXEL_SETTINGS_KEY,
    value: settings,
  });

  if (error) throw new Error(error.message);
}
