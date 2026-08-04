/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║        OMNI-MARKET GLOBAL ENGINE                             ║
 * ║  ITEC3115 - Assignment 4 | BS(CS) Spring 2026               ║
 * ║  All 23 GoF Design Patterns + SOLID Principles              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

 'use strict';

 // ─────────────────────────────────────────────────────────────────
 // SECTION 1: CREATIONAL PATTERNS
 // ─────────────────────────────────────────────────────────────────
 
 // ══════════════════════════════════════════════════════════════════
 // 1. SINGLETON — GlobalConfig
 //    SRP: Only manages global system-wide settings.
 //    DIP: High-level modules depend on this abstraction, not
 //         environment-specific values scattered across the code.
 // ══════════════════════════════════════════════════════════════════
 class GlobalConfig {
   constructor() {
     if (GlobalConfig._instance) return GlobalConfig._instance;
     this._settings = {
       currency:       'USD',
       taxRate:        0.10,
       maxConnections: 5,
       version:        '1.0.0',
       debug:          false,
     };
     GlobalConfig._instance = this;
   }
 
   static getInstance() {
     if (!GlobalConfig._instance) new GlobalConfig();
     return GlobalConfig._instance;
   }
 
   get(key)        { return this._settings[key]; }
   set(key, value) { this._settings[key] = value; return this; }
   getAll()        { return { ...this._settings }; }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 2. FACTORY METHOD — ProductFactory
 //    OCP: Add new product types by adding a new case—existing
 //         factory code never needs to change.
 //    LSP: Every product subclass (DigitalProduct, ServiceProduct)
 //         is fully substitutable for the base Product class.
 // ══════════════════════════════════════════════════════════════════
 
 /** Abstract base — SOLID LSP anchor */
 class Product {
   constructor(name, price) {
     if (new.target === Product)
       throw new Error('Product is abstract – instantiate a subclass.');
     this.id    = 'PRD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
     this.name  = name;
     this.price = price;
     this.type  = 'base';
   }
 
   getDetails() {
     return `[${this.type.toUpperCase()}] ${this.name} — $${this.price}`;
   }
 
   // PROTOTYPE hook — every subclass inherits this
   clone() {
     const copy = Object.create(Object.getPrototypeOf(this));
     Object.assign(copy, this);
     copy.id = 'PRD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
     return copy;
   }
 
   // Template for the Visitor pattern
   accept(visitor) { return visitor.visitProduct(this); }
 }
 
 class PhysicalProduct extends Product {
   constructor(name, price, weightKg) {
     super(name, price);
     this.weight = weightKg;
     this.type   = 'physical';
   }
   ship() { return `Shipping "${this.name}" (${this.weight} kg) via carrier.`; }
 }
 
 class DigitalProduct extends Product {
   constructor(name, price, downloadUrl) {
     super(name, price);
     this.downloadUrl = downloadUrl;
     this.type        = 'digital';
   }
   ship() { return `Sending download link → ${this.downloadUrl}`; }
 }
 
 class ServiceProduct extends Product {
   constructor(name, price, durationHours) {
     super(name, price);
     this.duration = durationHours;
     this.type     = 'service';
   }
   ship() { return `Scheduling "${this.name}" for ${this.duration} h.`; }
 }
 
 /** Factory Method */
 class ProductFactory {
   static createProduct(type, ...args) {
     const map = {
       physical: PhysicalProduct,
       digital:  DigitalProduct,
       service:  ServiceProduct,
     };
     const Cls = map[type];
     if (!Cls) throw new Error(`Unknown product type: "${type}"`);
     return new Cls(...args);
   }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 3. ABSTRACT FACTORY — Regional Package Kits
 //    OCP: Adding a new region requires only a new factory class.
 //    ISP: Label and Plug are separate interfaces; factories only
 //         implement what their region needs.
 // ══════════════════════════════════════════════════════════════════
 class US_Label { getLabel() { return 'US Standard Label (in English)'; } }
 class EU_Label { getLabel() { return 'EU Standard Label (multilingual)'; } }
 class UK_Label { getLabel() { return 'UK Royal Mail Label'; } }
 
 class US_Plug  { getSpec()  { return 'Type A/B — 120 V / 60 Hz'; } }
 class EU_Plug  { getSpec()  { return 'Type C/E/F — 230 V / 50 Hz'; } }
 class UK_Plug  { getSpec()  { return 'Type G — 230 V / 50 Hz'; } }
 
 class US_PackageFactory {
   createLabel() { return new US_Label(); }
   createPlug()  { return new US_Plug(); }
 }
 class EU_PackageFactory {
   createLabel() { return new EU_Label(); }
   createPlug()  { return new EU_Plug(); }
 }
 class UK_PackageFactory {
   createLabel() { return new UK_Label(); }
   createPlug()  { return new UK_Plug(); }
 }
 
 function getRegionalFactory(region) {
   const map = { US: US_PackageFactory, EU: EU_PackageFactory, UK: UK_PackageFactory };
   const Cls = map[region];
   if (!Cls) throw new Error(`Unsupported region: ${region}`);
   return new Cls();
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 4. BUILDER — Complex Order Construction
 //    SRP: OrderBuilder's sole job is to assemble an Order.
 //         Order is a pure data container.
 // ══════════════════════════════════════════════════════════════════
 class Order {
   constructor() {
     this.id            = 'ORD-' + Date.now();
     this.items         = [];          // { product, qty }
     this.discounts     = [];          // flat dollar amounts
     this.address       = null;
     this.paymentMethod = null;
     this.notes         = '';
     this.createdAt     = new Date().toISOString();
   }
 
   getSubtotal() {
     return this.items.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
   }
   getDiscountTotal() {
     return this.discounts.reduce((sum, d) => sum + d, 0);
   }
   getTotal() {
     return Math.max(0, this.getSubtotal() - this.getDiscountTotal());
   }
 
   toString() {
     return (
       `Order[${this.id}] ` +
       `Items:${this.items.length} ` +
       `Subtotal:$${this.getSubtotal().toFixed(2)} ` +
       `Discounts:-$${this.getDiscountTotal().toFixed(2)} ` +
       `Total:$${this.getTotal().toFixed(2)} ` +
       `Ship→${this.address}`
     );
   }
 
   // Template for Visitor pattern
   accept(visitor) { return visitor.visitOrder(this); }
 }
 
 class OrderBuilder {
   constructor() { this._order = new Order(); }
 
   addItem(product, qty = 1) {
     this._order.items.push({ product, qty });
     return this;
   }
   addDiscount(amount) {
     this._order.discounts.push(amount);
     return this;
   }
   setAddress(address) {
     this._order.address = address;
     return this;
   }
   setPaymentMethod(method) {
     this._order.paymentMethod = method;
     return this;
   }
   addNote(text) {
     this._order.notes = text;
     return this;
   }
   build() {
     if (!this._order.address)
       throw new Error('Order requires a shipping address.');
     const result = this._order;
     this._order = new Order(); // reset for reuse
     return result;
   }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 5. PROTOTYPE — Product Template Registry
 //    SRP: Registry only clones; it doesn't create from scratch.
 // ══════════════════════════════════════════════════════════════════
 class ProductTemplateRegistry {
   constructor() { this._templates = {}; }
 
   register(key, product) {
     this._templates[key] = product;
     return this;
   }
 
   clone(key) {
     if (!this._templates[key])
       throw new Error(`No template registered under key: "${key}"`);
     return this._templates[key].clone();
   }
 
   list() { return Object.keys(this._templates); }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 6. OBJECT POOL — DatabaseConnection Pool
 //    SRP: The pool manages connection lifecycle only.
 //    DIP: Callers depend on the pool interface, not raw DB objects.
 // ══════════════════════════════════════════════════════════════════
 class DatabaseConnection {
   constructor(id) {
     this.id    = id;
     this.inUse = false;
   }
   query(sql) {
     if (!this.inUse)
       throw new Error(`Connection #${this.id} is not acquired.`);
     return `[DB-Conn#${this.id}] ← "${sql}" → OK`;
   }
 }
 
 class DatabaseConnectionPool {
   constructor(poolSize = 5) {
     this._pool = Array.from(
       { length: poolSize },
       (_, i) => new DatabaseConnection(i + 1)
     );
   }
 
   acquire() {
     const conn = this._pool.find(c => !c.inUse);
     if (!conn) throw new Error('Connection pool exhausted — try again later.');
     conn.inUse = true;
     return conn;
   }
 
   release(conn) {
     conn.inUse = false;
   }
 
   stats() {
     const used = this._pool.filter(c => c.inUse).length;
     return `Pool: ${used}/${this._pool.length} in use`;
   }
 }
 
 // ─────────────────────────────────────────────────────────────────
 // SECTION 2: STRUCTURAL PATTERNS
 // ─────────────────────────────────────────────────────────────────
 
 // ══════════════════════════════════════════════════════════════════
 // 7. ADAPTER — Legacy XML Tax Calculator
 //    OCP: The adapter wraps the old system without touching it.
 //    DIP: JSON-based modules depend on TaxCalculatorAdapter
 //         (abstraction), never on LegacyXmlTaxCalculator directly.
 // ══════════════════════════════════════════════════════════════════
 
 /** Legacy system (untouchable) */
 class LegacyXmlTaxCalculator {
   calculateFromXml(xmlStr) {
     const m = xmlStr.match(/<amount>([\d.]+)<\/amount>/);
     if (!m) throw new Error('Invalid XML: missing <amount>');
     const amount = parseFloat(m[1]);
     const rateM  = xmlStr.match(/<rate>([\d.]+)<\/rate>/);
     const rate   = rateM ? parseFloat(rateM[1]) : 0.08;
     return parseFloat((amount * rate).toFixed(2));
   }
 }
 
 /** Adapter — converts JSON → XML → calls legacy → returns JSON */
 class TaxCalculatorAdapter {
   constructor() { this._legacy = new LegacyXmlTaxCalculator(); }
 
   calculate({ amount, rate = 0.08 }) {
     const xml = `<tax><amount>${amount}</amount><rate>${rate}</rate></tax>`;
     const tax = this._legacy.calculateFromXml(xml);
     return { amount, rate, tax, total: amount + tax };
   }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 8. BRIDGE — PaymentMethod ↔ BankProvider
 //    OCP: New payment methods and new providers are independent
 //         hierarchies—neither needs to change when the other grows.
 //    DIP: PaymentMethod depends on the provider abstraction.
 // ══════════════════════════════════════════════════════════════════
 
 /* Implementor hierarchy */
 class BankProvider {
   processPayment(amount) { throw new Error('Abstract'); }
   refund(amount)         { throw new Error('Abstract'); }
 }
 class StripeProvider extends BankProvider {
   processPayment(amount) { return `Stripe processed $${amount.toFixed(2)}`; }
   refund(amount)         { return `Stripe refunded $${amount.toFixed(2)}`; }
 }
 class PayPalProvider extends BankProvider {
   processPayment(amount) { return `PayPal processed $${amount.toFixed(2)}`; }
   refund(amount)         { return `PayPal refunded $${amount.toFixed(2)}`; }
 }
 class CoinbaseProvider extends BankProvider {
   processPayment(amount) { return `Coinbase processed ₿${(amount / 65000).toFixed(6)}`; }
   refund(amount)         { return `Coinbase refunded ₿${(amount / 65000).toFixed(6)}`; }
 }
 
 /* Abstraction hierarchy */
 class PaymentMethod {
   constructor(provider) {
     if (!(provider instanceof BankProvider))
       throw new TypeError('provider must extend BankProvider');
     this._provider = provider;
   }
   pay(amount)    { return this._provider.processPayment(amount); }
   refund(amount) { return this._provider.refund(amount); }
 }
 class CreditCardPayment extends PaymentMethod {
   pay(amount) {
     return `[Credit Card] ${this._provider.processPayment(amount)}`;
   }
 }
 class CryptoPayment extends PaymentMethod {
   pay(amount) {
     // 2 % crypto discount
     return `[Crypto] ${this._provider.processPayment(amount * 0.98)}`;
   }
 }
 class BuyNowPayLaterPayment extends PaymentMethod {
   pay(amount) {
     const installment = (amount / 4).toFixed(2);
     return `[BNPL] ${this._provider.processPayment(amount)} → 4×$${installment}`;
   }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 9. COMPOSITE — Recursive Packaging / Box
 //    SRP: Each component knows only its own price and description.
 // ══════════════════════════════════════════════════════════════════
 class PackagingComponent {
   getPrice()           { throw new Error('Abstract getPrice()'); }
   describe(indent = '') { throw new Error('Abstract describe()'); }
 }
 
 class PackageItem extends PackagingComponent {
   constructor(name, price) {
     super();
     this.name  = name;
     this.price = price;
   }
   getPrice()            { return this.price; }
   describe(indent = '') { return `${indent}├─ Item: ${this.name}  ($${this.price})`; }
 }
 
 class Box extends PackagingComponent {
   constructor(name, boxCost = 0) {
     super();
     this.name     = name;
     this.boxCost  = boxCost;   // cost of the box itself
     this._children = [];
   }
   add(component)    { this._children.push(component); return this; }
   remove(component) { this._children = this._children.filter(c => c !== component); }
   getPrice()        {
     return this.boxCost + this._children.reduce((s, c) => s + c.getPrice(), 0);
   }
   describe(indent = '') {
     let s = `${indent}┌─ Box: "${this.name}"  (box=$${this.boxCost})\n`;
     this._children.forEach(c => { s += c.describe(indent + '│  ') + '\n'; });
     s += `${indent}└─ Subtotal: $${this.getPrice()}`;
     return s;
   }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 10. DECORATOR — Dynamic Shipping Fee Wrappers
 //     OCP: New fee types are added as new decorators, zero edits to
 //          existing ones.
 //     SRP: Each decorator handles one additional responsibility.
 // ══════════════════════════════════════════════════════════════════
 class ShippingBase {
   constructor(order) { this._order = order; }
   getCost()        { return this._order.getTotal(); }
   getDescription() { return 'Base Order'; }
 }
 
 class ShippingDecorator {
   constructor(wrapped) { this._wrapped = wrapped; }
   getCost()        { return this._wrapped.getCost(); }
   getDescription() { return this._wrapped.getDescription(); }
 }
 
 class ExpressShippingDecorator extends ShippingDecorator {
   getCost()        { return this._wrapped.getCost() + 25; }
   getDescription() { return this._wrapped.getDescription() + ' + Express ($25)'; }
 }
 
 class FragileHandlingDecorator extends ShippingDecorator {
   getCost()        { return this._wrapped.getCost() + 10; }
   getDescription() { return this._wrapped.getDescription() + ' + Fragile ($10)'; }
 }
 
 class InsuranceDecorator extends ShippingDecorator {
   getCost()        { return this._wrapped.getCost() * 1.05; }
   getDescription() { return this._wrapped.getDescription() + ' + Insurance (5%)'; }
 }
 
 class ColdChainDecorator extends ShippingDecorator {
   getCost()        { return this._wrapped.getCost() + 40; }
   getDescription() { return this._wrapped.getDescription() + ' + Cold Chain ($40)'; }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 11. FLYWEIGHT — Shared ProductIcon Objects
 //     SRP: Icons only store and render shared visual data.
 // ══════════════════════════════════════════════════════════════════
 class ProductIconFlyweight {
   /** Intrinsic (shared) state */
   constructor(iconType, svgTemplate, colorHex) {
     this.iconType    = iconType;
     this.svgTemplate = svgTemplate;   // heavy shared data
     this.colorHex    = colorHex;
   }
 
   /** Extrinsic (per-instance) state passed in at runtime */
   render(productId, x, y, scale = 1) {
     return (
       `<Icon type="${this.iconType}" color="${this.colorHex}" ` +
       `x="${x}" y="${y}" scale="${scale}" product="${productId}" />`
     );
   }
 }
 
 class ProductIconFactory {
   constructor() { this._cache = new Map(); }
 
   getIcon(iconType, colorHex = '#888') {
     if (!this._cache.has(iconType)) {
       const flyweight = new ProductIconFlyweight(
         iconType,
         `<svg viewBox="0 0 32 32"><!-- ${iconType} SVG path data --></svg>`,
         colorHex
       );
       this._cache.set(iconType, flyweight);
     }
     return this._cache.get(iconType);
   }
 
   get uniqueIconCount() { return this._cache.size; }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 12. PROXY — AdminDashboard Security/Auth Layer
 //     SRP: The proxy handles authentication; the real dashboard
 //          handles only data retrieval.
 //     DIP: Callers depend on the same interface as the real object.
 // ══════════════════════════════════════════════════════════════════
 class AdminDashboard {
   getRevenue()      { return 'Total Revenue: $1,250,000'; }
   getUsers()        { return 'Total Users: 48,320'; }
   getInventory()    { return 'SKUs: 14,760 active'; }
   deleteUser(id)    { return `User #${id} permanently deleted.`; }
   resetPassword(id) { return `Password reset for user #${id}.`; }
 }
 
 const ROLE_PERMISSIONS = {
   viewer:     ['getRevenue', 'getUsers', 'getInventory'],
   admin:      ['getRevenue', 'getUsers', 'getInventory', 'resetPassword'],
   superadmin: ['getRevenue', 'getUsers', 'getInventory', 'resetPassword', 'deleteUser'],
 };
 
 class AdminDashboardProxy {
   constructor(currentUser) {
     this._dashboard = new AdminDashboard();
     this._user      = currentUser;
   }
 
   _authorize(action) {
     const perms = ROLE_PERMISSIONS[this._user.role] || [];
     if (!perms.includes(action)) {
       throw new Error(
         `[AUTH] DENIED: ${this._user.name} (role: ${this._user.role}) ` +
         `may not call "${action}".`
       );
     }
     console.log(`  [AUTH] GRANTED: ${this._user.name} → ${action}`);
   }
 
   getRevenue()      { this._authorize('getRevenue');      return this._dashboard.getRevenue(); }
   getUsers()        { this._authorize('getUsers');        return this._dashboard.getUsers(); }
   getInventory()    { this._authorize('getInventory');    return this._dashboard.getInventory(); }
   deleteUser(id)    { this._authorize('deleteUser');      return this._dashboard.deleteUser(id); }
   resetPassword(id) { this._authorize('resetPassword');   return this._dashboard.resetPassword(id); }
 }
 
 // ─────────────────────────────────────────────────────────────────
 // SECTION 3: BEHAVIORAL PATTERNS
 // ─────────────────────────────────────────────────────────────────
 
 // ══════════════════════════════════════════════════════════════════
 // 13. CHAIN OF RESPONSIBILITY — Order Approval Workflow
 //     OCP: Add a new level (e.g. Board) by appending a new handler.
 //     SRP: Each handler decides only its own approval limit.
 // ══════════════════════════════════════════════════════════════════
 class ApprovalHandler {
   constructor(role, limit) {
     this._role  = role;
     this._limit = limit;
     this._next  = null;
   }
 
   setNext(handler) { this._next = handler; return handler; }
 
   handle(order) {
     const total = order.getTotal();
     if (total <= this._limit) {
       return `✔ ${this._role} approved Order ${order.id} ($${total.toFixed(2)})`;
     }
     if (this._next) return this._next.handle(order);
     return `✘ Order ${order.id} ($${total.toFixed(2)}) exceeds CEO limit — REJECTED`;
   }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 14. COMMAND — Place/Cancel Order with Undo
 //     SRP: Each command encapsulates exactly one action + its undo.
 //     OCP: New commands (BulkOrder, RefundOrder) never touch
 //          existing commands.
 // ══════════════════════════════════════════════════════════════════
 class CommandHistory {
   constructor() { this._history = []; }
 
   execute(cmd) {
     const result = cmd.execute();
     this._history.push(cmd);
     return result;
   }
 
   undo() {
     const cmd = this._history.pop();
     if (cmd) return cmd.undo();
     return '(nothing to undo)';
   }
 
   get size() { return this._history.length; }
 }
 
 class OrderService {
   constructor() { this._placed = new Map(); }
 
   placeOrder(order) {
     this._placed.set(order.id, order);
     return `  ▶ Placed  ${order.id}`;
   }
 
   cancelOrder(order) {
     this._placed.delete(order.id);
     return `  ▶ Cancelled ${order.id}`;
   }
 
   getOrders() { return [...this._placed.keys()]; }
 }
 
 class PlaceOrderCommand {
   constructor(service, order) { this._svc = service; this._order = order; }
   execute() { return this._svc.placeOrder(this._order); }
   undo()    { return this._svc.cancelOrder(this._order); }
 }
 
 class CancelOrderCommand {
   constructor(service, order) { this._svc = service; this._order = order; }
   execute() { return this._svc.cancelOrder(this._order); }
   undo()    { return this._svc.placeOrder(this._order); }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 15. INTERPRETER — Search Query Parser
 //     SRP: Each expression class interprets only one condition.
 //     OCP: Add a new keyword (e.g. "brand ==") as a new class.
 // ══════════════════════════════════════════════════════════════════
 class PriceExpression {
   constructor(op, value) { this._op = op; this._value = value; }
   interpret(p) {
     const ops = { '<': (a,b)=>a<b, '>': (a,b)=>a>b, '<=': (a,b)=>a<=b,
                   '>=': (a,b)=>a>=b, '==': (a,b)=>a==b, '!=': (a,b)=>a!=b };
     return ops[this._op]?.(p.price, this._value) ?? false;
   }
 }
 
 class CategoryExpression {
   constructor(op, value) { this._op = op; this._value = value; }
   interpret(p) {
     return this._op === '==' ? p.type === this._value : p.type !== this._value;
   }
 }
 
 class AndExpression {
   constructor(left, right) { this._l = left; this._r = right; }
   interpret(p) { return this._l.interpret(p) && this._r.interpret(p); }
 }
 
 class OrExpression {
   constructor(left, right) { this._l = left; this._r = right; }
   interpret(p) { return this._l.interpret(p) || this._r.interpret(p); }
 }
 
 class SearchQueryParser {
   /**
    * Parses queries like:
    *   "price < 100 AND category == 'digital'"
    *   "price >= 50 AND price <= 500"
    */
   parse(query) {
     const andParts = query.split(/\s+AND\s+/);
     const exprs = andParts.map(part => {
       part = part.trim();
       const priceM = part.match(/^price\s*([<>=!]+)\s*([\d.]+)$/);
       const catM   = part.match(/^category\s*([=!]+)\s*['"](\w+)['"]\s*$/);
       if (priceM) return new PriceExpression(priceM[1], parseFloat(priceM[2]));
       if (catM)   return new CategoryExpression(catM[1], catM[2]);
       throw new SyntaxError(`Cannot parse token: "${part}"`);
     });
     return exprs.reduce((acc, expr) => (acc ? new AndExpression(acc, expr) : expr), null);
   }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 16. ITERATOR — Inventory with Custom Iteration
 //     SRP: Inventory manages storage; iteration logic is separate.
 //     ISP: Consumers only use the iterator interface they need.
 // ══════════════════════════════════════════════════════════════════
 class Inventory {
   constructor() { this._items = []; }
 
   addProduct(product) { this._items.push(product); return this; }
 
   /** Default iterator — iterates every product */
   [Symbol.iterator]() {
     let idx = 0;
     const items = this._items;
     return {
       next() {
         return idx < items.length
           ? { value: items[idx++], done: false }
           : { value: undefined, done: true };
       }
     };
   }
 
   /** Filtered iterator — lazy evaluation */
   filter(predicate) {
     const items = this._items;
     return {
       [Symbol.iterator]() {
         let idx = 0;
         return {
           next() {
             while (idx < items.length) {
               const item = items[idx++];
               if (predicate(item)) return { value: item, done: false };
             }
             return { value: undefined, done: true };
           }
         };
       }
     };
   }
 
   get size() { return this._items.length; }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 17. MEDIATOR — ControlTower (Warehouse ↔ Courier ↔ Customer)
 //     SRP: ControlTower routes messages; participants don't know
 //          each other.
 //     DIP: Participants depend on the mediator abstraction.
 // ══════════════════════════════════════════════════════════════════
 class ControlTower {
   constructor() { this._participants = {}; }
 
   register(name, participant) {
     this._participants[name] = participant;
     participant.setMediator(this);
     return this;
   }
 
   relay(senderName, event, data) {
     console.log(`  [ControlTower] ${senderName} ──► EVENT: ${event}`);
     for (const [name, p] of Object.entries(this._participants)) {
       if (name !== senderName) p.receive(senderName, event, data);
     }
   }
 }
 
 class Participant {
   constructor(name) { this._name = name; this._mediator = null; }
   setMediator(m)    { this._mediator = m; }
   send(event, data) { this._mediator.relay(this._name, event, data); }
   receive(from, event, data) {
     console.log(`     [${this._name}] ← "${event}" from ${from} | data: ${JSON.stringify(data)}`);
   }
 }
 
 class Warehouse   extends Participant { constructor() { super('Warehouse'); } }
 class Courier     extends Participant { constructor() { super('Courier'); } }
 class CustomerHub extends Participant { constructor() { super('CustomerHub'); } }
 
 // ══════════════════════════════════════════════════════════════════
 // 18. MEMENTO — Shopping Cart Undo/Restore
 //     SRP: CartMemento only stores a snapshot; ShoppingCart manages
 //          live state; CartHistory manages snapshot history.
 // ══════════════════════════════════════════════════════════════════
 class CartMemento {
   constructor(items, coupon) {
     this._items     = JSON.parse(JSON.stringify(items)); // deep copy
     this._coupon    = coupon;
     this.savedAt    = new Date().toISOString();
   }
   get items()  { return JSON.parse(JSON.stringify(this._items)); }
   get coupon() { return this._coupon; }
 }
 
 class ShoppingCart {
   constructor() {
     this._items  = [];
     this._coupon = null;
   }
 
   addItem(item)     { this._items.push(item); return this; }
   removeItem(name)  { this._items = this._items.filter(i => i.name !== name); return this; }
   applyCoupon(code) { this._coupon = code; return this; }
   getTotal()        { return this._items.reduce((s, i) => s + i.price * (i.qty || 1), 0); }
 
   save()              { return new CartMemento(this._items, this._coupon); }
   restore(memento)    { this._items = memento.items; this._coupon = memento.coupon; }
 
   toString() {
     const names = this._items.map(i => `${i.name}×${i.qty||1}`).join(', ');
     return `Cart[${names}] coupon=${this._coupon} total=$${this.getTotal()}`;
   }
 }
 
 class CartHistory {
   constructor() { this._stack = []; }
   push(memento) { this._stack.push(memento); }
   pop()         { return this._stack.pop() || null; }
   get depth()   { return this._stack.length; }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 19. OBSERVER — Back-in-Stock Notification System
 //     OCP: New notification channels (SMS, Email) implement the
 //          Observer interface without touching StockNotifier.
 // ══════════════════════════════════════════════════════════════════
 class StockNotifier {
   constructor(productName) {
     this._productName  = productName;
     this._subscribers  = new Set();
     this._inStock      = false;
   }
 
   subscribe(observer)   { this._subscribers.add(observer); return this; }
   unsubscribe(observer) { this._subscribers.delete(observer); return this; }
 
   setStock(inStock) {
     const changed  = this._inStock !== inStock;
     this._inStock  = inStock;
     if (inStock && changed) this._notifyAll();
   }
 
   _notifyAll() {
     this._subscribers.forEach(obs => obs.onStockAvailable(this._productName));
   }
 }
 
 class EmailObserver {
   constructor(email) { this._email = email; }
   onStockAvailable(productName) {
     console.log(`  [EMAIL → ${this._email}] "${productName}" is back in stock!`);
   }
 }
 
 class SMSObserver {
   constructor(phone) { this._phone = phone; }
   onStockAvailable(productName) {
     console.log(`  [SMS → ${this._phone}] RESTOCK ALERT: ${productName}`);
   }
 }
 
 class AppPushObserver {
   constructor(userId) { this._userId = userId; }
   onStockAvailable(productName) {
     console.log(`  [PUSH → user#${this._userId}] 🛒 ${productName} available now!`);
   }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 20. STRATEGY — Discount Algorithms
 //     OCP: Add SeasonalDiscount as a new class — zero existing edits.
 //     DIP: PriceCalculator depends on the strategy interface.
 // ══════════════════════════════════════════════════════════════════
 class FlatDiscountStrategy {
   constructor(amount = 20) { this._amount = amount; }
   calculate(price) { return Math.max(0, price - this._amount); }
   describe()       { return `Flat -$${this._amount}`; }
 }
 
 class PercentageDiscountStrategy {
   constructor(pct) { this._pct = pct; }
   calculate(price) { return price * (1 - this._pct / 100); }
   describe()       { return `${this._pct}% off`; }
 }
 
 class SeasonalDiscountStrategy {
   calculate(price) {
     const m = new Date().getMonth(); // 0-based
     const isSeason = m === 11 || m === 0; // Dec or Jan
     return price * (isSeason ? 0.70 : 0.90);
   }
   describe() { return 'Seasonal (70% Dec/Jan, 90% otherwise)'; }
 }
 
 class BuyOneGetOneStrategy {
   calculate(price) { return price / 2; } // per-unit cost halved
   describe()       { return 'Buy-One-Get-One (50% per item)'; }
 }
 
 class PriceCalculator {
   constructor(strategy) { this._strategy = strategy; }
   setStrategy(s)  { this._strategy = s; }
   calculate(price) {
     return parseFloat(this._strategy.calculate(price).toFixed(2));
   }
   getStrategyName() { return this._strategy.describe(); }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 21. TEMPLATE METHOD — ShippingProcess
 //     OCP: New shipping types (DroneShipping) subclass and override
 //          only calculateShipping() — the process() skeleton stays.
 //     SRP: The base class owns the algorithm skeleton; subclasses
 //          own only the variable step.
 // ══════════════════════════════════════════════════════════════════
 class ShippingProcess {
   /** Template method — final algorithm skeleton */
   process(order) {
     this.validateOrder(order);
     this.packItems(order);
     const cost = this.calculateShipping(order);  // abstract hook
     this.labelPackage(order, cost);
     this.dispatchOrder(order);
     this.notifyCustomer(order);
     return cost;
   }
 
   validateOrder(order) {
     if (!order.address) throw new Error('No shipping address set.');
     console.log(`    [Ship] Validated ${order.id}`);
   }
   packItems(order) {
     console.log(`    [Ship] Packed ${order.items.length} item(s)`);
   }
   labelPackage(order, cost) {
     console.log(`    [Ship] Label applied — shipping cost $${cost.toFixed(2)}`);
   }
   dispatchOrder(order) {
     console.log(`    [Ship] Dispatched ${order.id} → ${order.address}`);
   }
   notifyCustomer(order) {
     console.log(`    [Ship] Customer notified for ${order.id}`);
   }
 
   /** Hook — must be overridden */
   calculateShipping(order) { throw new Error('Implement calculateShipping()'); }
 }
 
 class DomesticShipping extends ShippingProcess {
   calculateShipping(order) {
     const cost = 5 + order.items.length * 1.5;
     console.log(`    [Domestic] Flat-rate calc → $${cost}`);
     return cost;
   }
 }
 
 class InternationalShipping extends ShippingProcess {
   calculateShipping(order) {
     const cost = order.getTotal() * 0.12;
     console.log(`    [International] 12% of order value → $${cost.toFixed(2)}`);
     return cost;
   }
 }
 
 class DroneShipping extends ShippingProcess {
   calculateShipping(order) {
     const cost = 15; // fixed premium
     console.log(`    [Drone] Fixed drone fee → $${cost}`);
     return cost;
   }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 22. VISITOR — Tax Report & Shipping Report
 //     OCP: Add a new report (RevenueReportVisitor) without touching
 //          Order or Product classes.
 //     SRP: Each visitor class owns one reporting concern.
 // ══════════════════════════════════════════════════════════════════
 class TaxReportVisitor {
   visitOrder(order) {
     const tax = order.getTotal() * GlobalConfig.getInstance().get('taxRate');
     return (
       `[TAX REPORT] Order ${order.id} | ` +
       `Subtotal=$${order.getTotal().toFixed(2)} | ` +
       `Tax=$${tax.toFixed(2)} | ` +
       `Grand Total=$${(order.getTotal() + tax).toFixed(2)}`
     );
   }
   visitProduct(product) {
     const tax = product.price * GlobalConfig.getInstance().get('taxRate');
     return `[TAX REPORT] Product "${product.name}" | Price=$${product.price} | Tax=$${tax.toFixed(2)}`;
   }
 }
 
 class ShippingReportVisitor {
   visitOrder(order) {
     const weight = order.items.reduce((s, { product, qty }) =>
       s + (product.weight || 0) * qty, 0);
     return (
       `[SHIPPING REPORT] Order ${order.id} | ` +
       `Items=${order.items.length} | ` +
       `Est. Weight=${weight.toFixed(2)} kg`
     );
   }
   visitProduct(product) {
     return (
       `[SHIPPING REPORT] Product "${product.name}" | ` +
       `Weight=${product.weight || 'N/A'} kg`
     );
   }
 }
 
 class RevenueReportVisitor {
   visitOrder(order) {
     return `[REVENUE REPORT] Order ${order.id} | Revenue=$${order.getTotal().toFixed(2)}`;
   }
   visitProduct(product) {
     return `[REVENUE REPORT] Product "${product.name}" | List=$${product.price}`;
   }
 }
 
 // ══════════════════════════════════════════════════════════════════
 // 23. NULL OBJECT — Guest User / NullDiscount
 //     SRP: GuestUser and NullDiscount each handle exactly one case.
 //     LSP: GuestUser is fully substitutable for RegisteredUser.
 // ══════════════════════════════════════════════════════════════════
 class RegisteredUser {
   constructor(name, loyaltyPoints) {
     this.name          = name;
     this.loyaltyPoints = loyaltyPoints;
   }
   getName()          { return this.name; }
   getLoyaltyPoints() { return this.loyaltyPoints; }
   getDiscountPct()   { return this.loyaltyPoints > 100 ? 15 : 5; }
   isGuest()          { return false; }
 }
 
 class GuestUser {
   getName()          { return 'Guest'; }
   getLoyaltyPoints() { return 0; }
   getDiscountPct()   { return 0; }
   isGuest()          { return true; }
 }
 
 class NullDiscount {
   calculate(price) { return price; }
   describe()       { return 'No discount'; }
 }
 
 // ─────────────────────────────────────────────────────────────────
 // DEMONSTRATION RUNNER
 // ─────────────────────────────────────────────────────────────────
 function banner(title) {
   const line = '═'.repeat(64);
   console.log(`\n${line}`);
   console.log(` ▶  ${title}`);
   console.log(line);
 }
 
 function run() {
   console.log('╔════════════════════════════════════════════════════════════╗');
   console.log('║      OMNI-MARKET GLOBAL ENGINE — Pattern Demo              ║');
   console.log('╚════════════════════════════════════════════════════════════╝');
 
   // ──────────────────────────────────────────
   banner('1. SINGLETON — GlobalConfig');
   const cfg1 = GlobalConfig.getInstance();
   const cfg2 = GlobalConfig.getInstance();
   cfg1.set('currency', 'USD').set('taxRate', 0.10);
   console.log('  Same instance?', cfg1 === cfg2);            // true
   console.log('  Settings:', cfg2.getAll());
 
   // ──────────────────────────────────────────
   banner('2. FACTORY METHOD — ProductFactory');
   const laptop  = ProductFactory.createProduct('physical', 'Laptop Pro',       1200, 2.5);
   const ebook   = ProductFactory.createProduct('digital',  'JS Design Patterns', 29.99, 'https://dl.omnimarket.io/jsdp');
   const support = ProductFactory.createProduct('service',  '24h Tech Support',   49.99, 1);
   const phone   = ProductFactory.createProduct('physical', 'OmniPhone X',        999, 0.18);
   [laptop, ebook, support, phone].forEach(p => console.log(' ', p.getDetails()));
 
   // ──────────────────────────────────────────
   banner('3. ABSTRACT FACTORY — Regional Kits');
   ['US', 'EU', 'UK'].forEach(region => {
     const factory = getRegionalFactory(region);
     const label   = factory.createLabel();
     const plug    = factory.createPlug();
     console.log(`  ${region}: ${label.getLabel()} | ${plug.getSpec()}`);
   });
 
   // ──────────────────────────────────────────
   banner('4. BUILDER — Complex Order Assembly');
   const order = new OrderBuilder()
     .addItem(laptop, 1)
     .addItem(ebook,  2)
     .addItem(phone,  1)
     .addDiscount(100)
     .addDiscount(50)
     .setAddress('42 Quaid Ave, Islamabad, PK')
     .setPaymentMethod('Credit Card')
     .addNote('Leave at reception.')
     .build();
   console.log(' ', order.toString());
 
   // ──────────────────────────────────────────
   banner('5. PROTOTYPE — Clone Product Templates');
   const templateRegistry = new ProductTemplateRegistry();
   templateRegistry.register('laptop-template', laptop);
   const gamingLaptop = templateRegistry.clone('laptop-template');
   gamingLaptop.name  = 'Gaming Beast Pro';
   gamingLaptop.price = 2499;
   console.log('  Original :', laptop.getDetails());
   console.log('  Clone    :', gamingLaptop.getDetails());
   console.log('  Same obj?', laptop === gamingLaptop);   // false
 
   // ──────────────────────────────────────────
   banner('6. OBJECT POOL — Database Connections');
   const pool  = new DatabaseConnectionPool(3);
   const c1    = pool.acquire();
   const c2    = pool.acquire();
   console.log(' ', c1.query('SELECT * FROM orders LIMIT 10'));
   console.log(' ', c2.query('SELECT * FROM products WHERE active=1'));
   console.log(' ', pool.stats());
   pool.release(c1);
   const c3 = pool.acquire();   // reuses released slot
   console.log(`  Reacquired connection id: ${c3.id}`);
   console.log(' ', pool.stats());
 
   // ──────────────────────────────────────────
   banner('7. ADAPTER — Legacy XML Tax Calculator');
   const taxAdapter = new TaxCalculatorAdapter();
   const r1 = taxAdapter.calculate({ amount: 1200,  rate: 0.10 });
   const r2 = taxAdapter.calculate({ amount: 29.99, rate: 0.05 });
   console.log(`  Laptop tax:  $${r1.tax}  → total $${r1.total.toFixed(2)}`);
   console.log(`  eBook tax:   $${r2.tax}  → total $${r2.total.toFixed(2)}`);
 
   // ──────────────────────────────────────────
   banner('8. BRIDGE — PaymentMethod × BankProvider');
   const payments = [
     new CreditCardPayment(new StripeProvider()),
     new CryptoPayment(new CoinbaseProvider()),
     new BuyNowPayLaterPayment(new PayPalProvider()),
     new CreditCardPayment(new PayPalProvider()),
   ];
   payments.forEach(p => console.log(' ', p.pay(300)));
 
   // ──────────────────────────────────────────
   banner('9. COMPOSITE — Recursive Packaging');
   const masterBox    = new Box('Master Carton', 8);
   const electronicsBox = new Box('Electronics Box', 3);
   electronicsBox
     .add(new PackageItem('Laptop Pro',   1200))
     .add(new PackageItem('Power Adapter',  35));
   const mediaBox = new Box('Media Box', 2);
   mediaBox
     .add(new PackageItem('JS Design Patterns (book)',  29.99))
     .add(new PackageItem('OmniPhone X',               999));
   masterBox
     .add(electronicsBox)
     .add(mediaBox)
     .add(new PackageItem('Bubble Wrap',  2.50));
   console.log(masterBox.describe());
   console.log(`  ► Total Package Value: $${masterBox.getPrice()}`);
 
   // ──────────────────────────────────────────
   banner('10. DECORATOR — Dynamic Shipping Fees');
   let shipping = new ShippingBase(order);
   shipping = new ExpressShippingDecorator(shipping);
   shipping = new FragileHandlingDecorator(shipping);
   shipping = new InsuranceDecorator(shipping);
   console.log('  Description:', shipping.getDescription());
   console.log(`  Final Cost : $${shipping.getCost().toFixed(2)}`);
 
   // ──────────────────────────────────────────
   banner('11. FLYWEIGHT — Shared Product Icons');
   const iconFactory = new ProductIconFactory();
   const catalogue   = [
     { id: 'p001', type: 'electronics', x: 0,   y: 0  },
     { id: 'p002', type: 'books',       x: 50,  y: 0  },
     { id: 'p003', type: 'electronics', x: 100, y: 0  },
     { id: 'p004', type: 'clothing',    x: 150, y: 0  },
     { id: 'p005', type: 'electronics', x: 200, y: 0  },
     { id: 'p006', type: 'books',       x: 250, y: 0  },
   ];
   const colorMap = { electronics: '#3B82F6', books: '#10B981', clothing: '#F59E0B' };
   catalogue.forEach(item => {
     const icon = iconFactory.getIcon(item.type, colorMap[item.type]);
     console.log(' ', icon.render(item.id, item.x, item.y));
   });
   console.log(`  Unique icon objects created: ${iconFactory.uniqueIconCount} (shared across ${catalogue.length} renders)`);
 
   // ──────────────────────────────────────────
   banner('12. PROXY — Admin Dashboard Auth');
   const adminProxy  = new AdminDashboardProxy({ name: 'Alice',  role: 'admin' });
   const viewerProxy = new AdminDashboardProxy({ name: 'Bob',    role: 'viewer' });
   const superProxy  = new AdminDashboardProxy({ name: 'Carlos', role: 'superadmin' });
 
   console.log(' ', adminProxy.getRevenue());
   try {
     viewerProxy.resetPassword(42);
   } catch (e) { console.log(' ', e.message); }
   console.log(' ', superProxy.deleteUser(99));
 
   // ──────────────────────────────────────────
   banner('13. CHAIN OF RESPONSIBILITY — Order Approval');
   const manager  = new ApprovalHandler('Manager',  500);
   const director = new ApprovalHandler('Director', 5_000);
   const ceo      = new ApprovalHandler('CEO',      50_000);
   manager.setNext(director).setNext(ceo);
 
   const small = new OrderBuilder()
     .addItem({ name: 'USB Hub', price: 30, type: 'physical' }, 3)
     .setAddress('NYC').build();
   const medium = new OrderBuilder()
     .addItem({ name: 'Server Rack', price: 3_000, type: 'physical' }, 1)
     .setAddress('LA').build();
   const large = new OrderBuilder()
     .addItem({ name: 'Enterprise License', price: 40_000, type: 'service' }, 1)
     .setAddress('London').build();
   const tooBig = new OrderBuilder()
     .addItem({ name: 'Data Center Build', price: 100_000, type: 'service' }, 1)
     .setAddress('Dubai').build();
 
   [small, medium, large, tooBig].forEach(o =>
     console.log(' ', manager.handle(o))
   );
 
   // ──────────────────────────────────────────
   banner('14. COMMAND — PlaceOrder / CancelOrder with Undo');
   const orderSvc = new OrderService();
   const cmdHist  = new CommandHistory();
 
   console.log(cmdHist.execute(new PlaceOrderCommand(orderSvc, order)));
   console.log('  Active:', orderSvc.getOrders());
   console.log('  Undo:', cmdHist.undo());
   console.log('  Active after undo:', orderSvc.getOrders());
   console.log(cmdHist.execute(new PlaceOrderCommand(orderSvc, order)));
   console.log(cmdHist.execute(new CancelOrderCommand(orderSvc, order)));
   console.log('  Undo cancel:', cmdHist.undo());
   console.log('  Active:', orderSvc.getOrders());
 
   // ──────────────────────────────────────────
   banner('15. INTERPRETER — Search Query Parser');
   const parser    = new SearchQueryParser();
   const inventory = new Inventory();
   [laptop, ebook, support, phone, gamingLaptop].forEach(p => inventory.addProduct(p));
 
   const q1 = "price < 100 AND category == 'digital'";
   const q2 = "price >= 500 AND category == 'physical'";
 
   [q1, q2].forEach(q => {
     const expr    = parser.parse(q);
     const results = [...inventory].filter(p => expr.interpret(p));
     console.log(`  Query: "${q}"`);
     console.log(`  → ${results.map(p => p.name).join(', ') || 'No results'}\n`);
   });
 
   // ──────────────────────────────────────────
   banner('16. ITERATOR — Inventory Traversal');
   console.log('  All products:');
   for (const p of inventory) console.log(`    ${p.getDetails()}`);
 
   console.log('\n  Physical only (filter iterator):');
   for (const p of inventory.filter(p => p.type === 'physical'))
     console.log(`    ${p.getDetails()}`);
 
   // ──────────────────────────────────────────
   banner('17. MEDIATOR — ControlTower');
   const tower      = new ControlTower();
   const warehouse  = new Warehouse();
   const courier    = new Courier();
   const custHub    = new CustomerHub();
   tower.register('Warehouse',    warehouse)
        .register('Courier',      courier)
        .register('CustomerHub',  custHub);
 
   warehouse.send('ORDER_PACKED',    { orderId: order.id, boxes: 2 });
   courier.send('PICKUP_CONFIRMED',  { driver: 'Raza', eta: '2h' });
   custHub.send('DELIVERY_QUERY',    { orderId: order.id });
 
   // ──────────────────────────────────────────
   banner('18. MEMENTO — Shopping Cart Undo');
   const cart    = new ShoppingCart();
   const cartHis = new CartHistory();
 
   cart.addItem({ name: 'Laptop Pro',  price: 1200, qty: 1 });
   cartHis.push(cart.save());                         // snapshot 1
   console.log('  After laptop  :', cart.toString());
 
   cart.addItem({ name: 'Wireless Mouse', price: 35, qty: 2 });
   cart.applyCoupon('SAVE10');
   cartHis.push(cart.save());                         // snapshot 2
   console.log('  After mouse + coupon:', cart.toString());
 
   cart.addItem({ name: 'Keyboard', price: 89, qty: 1 });
   console.log('  After keyboard:', cart.toString());
 
   cart.restore(cartHis.pop());                       // restore snap 2
   console.log('  After undo    :', cart.toString());
 
   cart.restore(cartHis.pop());                       // restore snap 1
   console.log('  After undo×2  :', cart.toString());
 
   // ──────────────────────────────────────────
   banner('19. OBSERVER — Back-in-Stock Notifications');
   const ps5  = new StockNotifier('PlayStation 5');
   const obs1 = new EmailObserver('ali@omni.pk');
   const obs2 = new SMSObserver('+92-300-1234567');
   const obs3 = new AppPushObserver('u_9921');
   ps5.subscribe(obs1).subscribe(obs2).subscribe(obs3);
   ps5.unsubscribe(obs2);                     // Bob opted out
   console.log('  Setting stock = true (notifies obs1 & obs3 only):');
   ps5.setStock(true);
   ps5.setStock(true);                        // no duplicate fire
 
   // ──────────────────────────────────────────
   banner('20. STRATEGY — Discount Algorithms');
   const calculator = new PriceCalculator(new FlatDiscountStrategy(20));
   const testPrice  = 200;
   [
     new FlatDiscountStrategy(20),
     new PercentageDiscountStrategy(30),
     new SeasonalDiscountStrategy(),
     new BuyOneGetOneStrategy(),
   ].forEach(strategy => {
     calculator.setStrategy(strategy);
     console.log(
       `  ${strategy.describe().padEnd(36)} $${testPrice} → $${calculator.calculate(testPrice)}`
     );
   });
 
   // ──────────────────────────────────────────
   banner('21. TEMPLATE METHOD — Shipping Process');
   const processes = [
     { label: 'Domestic',      processor: new DomesticShipping() },
     { label: 'International', processor: new InternationalShipping() },
     { label: 'Drone',         processor: new DroneShipping() },
   ];
   processes.forEach(({ label, processor }) => {
     console.log(`\n  ── ${label} ──`);
     processor.process(order);
   });
 
   // ──────────────────────────────────────────
   banner('22. VISITOR — System Reports');
   const taxVisitor  = new TaxReportVisitor();
   const shipVisitor = new ShippingReportVisitor();
   const revVisitor  = new RevenueReportVisitor();
 
   [taxVisitor, shipVisitor, revVisitor].forEach(visitor => {
     console.log(' ', order.accept(visitor));
     console.log(' ', laptop.accept(visitor));
   });
 
   // ──────────────────────────────────────────
   banner('23. NULL OBJECT — Guest User / NullDiscount');
   const users = [
     new RegisteredUser('Bilal', 250),
     new GuestUser(),
     new RegisteredUser('Sara', 40),
     new GuestUser(),
   ];
 
   users.forEach(user => {
     const strategy = user.getDiscountPct() > 0
       ? new PercentageDiscountStrategy(user.getDiscountPct())
       : new NullDiscount();
     const finalPrice = strategy.calculate(1000);
     console.log(
       `  ${user.getName().padEnd(10)} | ` +
       `Points:${user.getLoyaltyPoints()} | ` +
       `Strategy: ${strategy.describe().padEnd(12)} | ` +
       `Final: $${finalPrice}`
     );
   });
 
   // ──────────────────────────────────────────
   const line = '═'.repeat(64);
   console.log(`\n${line}`);
   console.log(' ✔  ALL 23 DESIGN PATTERNS DEMONSTRATED SUCCESSFULLY');
   console.log(line);
 }
 
 run();