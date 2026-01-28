# Branch Comparison: `kibang0` (Professional) vs. `stunna` (Needs Refactoring)

This document aims to highlight the professional patterns established in the `kibang0` branch and contrast them with typical anti-patterns expected in the `stunna` branch, which requires refactoring. It concludes with a checklist to guide the refactoring process.

## Part 1: `kibang0` Professional Patterns (Actual Best Practices)

The `kibang0` branch adheres to a robust set of software engineering best practices, emphasizing TypeScript for type safety, React Query for data management, clear separation of concerns, and consistent naming conventions.

### 1. Service Layer Patterns (`src/services/`)

All API interactions are encapsulated within a dedicated `services` directory, ensuring that components are decoupled from the low-level data fetching logic.

*   **`src/services/api.ts` - Centralized Axios Instance:**
    *   Configures a single `axios` instance with a base URL (from environment variables), default headers, and `withCredentials` for authentication.
    *   Includes request and response interceptors for global concerns like error logging.
    ```typescript
    // src/services/api.ts
    import axios from 'axios';

    const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://212.115.110.115:8080/api';

    export const api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    });

    api.interceptors.response.use(
        (response) => {
            return response; // IMPORTANT: return full AxiosResponse
        },
        (error) => {
            if (error.response) {
                console.error('[API ERROR]', {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response.status,
                    data: error.response.data,
                });
            } // ... (rest of error handling)
            return Promise.reject(error);
        },
    );
    ```

*   **Domain-Specific Services (e.g., `menuService.ts`, `orderService.ts`, `supplierService.ts`):**
    *   Each service is an object containing `async` methods for specific CRUD operations or queries related to a domain.
    *   These methods utilize the centralized `api` instance and return `Promise`s of strongly typed data.
    ```typescript
    // src/services/menuService.ts
    import { api } from './api';
    import type {
        MenuItem,
        MenuAddon,
        MenuSideDish,
        MenuCategory,
    } from '../types/menuType';

    export const MenuService = {
        getAllMenuItems: async (): Promise<MenuItem[]> => {
            const response = await api.get('/menu/menu-items');
            return response.data;
        },

        createMenuItem: async (
            menuItemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>,
        ): Promise<MenuItem> => {
            const response = await api.post('/menu/menu-items', menuItemData);
            return response.data;
        },
        // ... other methods
    };
    ```

### 2. TypeScript Usage

TypeScript is consistently applied to ensure type safety, improve developer experience, and catch errors early.

*   **Centralized Type Definitions:** Common interfaces and types are defined in `src/types/` (e.g., `src/types/menuType.ts`, `src/types/orderTypes.ts`).
    ```typescript
    // src/types/menuType.ts (summary - actual file is more extensive)
    export interface MenuItem {
        id: number;
        name: string;
        description: string;
        price: number;
        isAvailable: boolean;
        prepArea: string;
        categoryId: number;
        rating: number;
        cost: number | null;
        // ... more fields
    }

    export interface MenuCategory {
        id: number;
        name: string;
        description: string;
        prepArea: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }
    ```
*   **Explicit Typing in Services and Components:** All function parameters, return values, and state variables are explicitly typed.
    ```typescript
    // src/services/menuService.ts (example from above)
    createMenuItem: async (
        menuItemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>,
    ): Promise<MenuItem> => { /* ... */ },
    ```
    ```typescript
    // src/pages/Dashboard.tsx (example from props)
    import { StatCard } from "@/components/dashboard/StatCard";
    // ...
    <StatCard
        title="Today's Revenue"
        value={(4856 * 2400).toLocaleString('en-US', {  })}
        change="+12.5% from yesterday"
        changeType="positive"
        icon={DollarSign}
        iconColor="primary"
    />
    ```

### 3. React Query Usage

React Query is the cornerstone for data fetching, caching, synchronization, and managing server state.

*   **Global Configuration:** `QueryClientProvider` wraps the entire application in `src/App.tsx`.
    ```typescript
    // src/App.tsx
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    // ...
    const queryClient = new QueryClient();
    const App = () => (
        <QueryClientProvider client={queryClient}>
            {/* ... */}
        </QueryClientProvider>
    );
    ```
*   **`useQuery` for Data Fetching:**
    *   Used in pages/components to fetch data, providing `isLoading`, `isError`, `data`, `error` states.
    *   `queryKey` arrays are used for caching and re-fetching logic.
    *   `queryFn` calls the domain-specific service methods.
    *   `enabled` property for conditional fetching.
    *   `staleTime` and `refetchInterval` for caching and real-time updates.
    ```typescript
    // src/pages/Menu.tsx
    // Fetch menu items
    const {
        data: menuItemsData,
        isLoading: isLoadingMenuItems,
        error: menuItemsError,
    } = useQuery<MenuItem[], Error>({
        queryKey: ['menuItems'],
        queryFn: MenuService.getAllMenuItems,
    });

    // Fetch categories
    const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<
        MenuCategory[],
        Error
    >({
        queryKey: ['menuCategories'],
        queryFn: MenuService.getAllMenuCategories,
    });
    ```
*   **`useMutation` for Data Modifications:**
    *   Used for POST, PUT, DELETE operations.
    *   `onSuccess` callbacks typically invalidate relevant `useQuery` caches to ensure the UI updates automatically.
    *   `onError` callbacks handle displaying errors.
    *   `isPending` for managing UI loading states on buttons/forms.
    ```typescript
    // src/pages/Menu.tsx
    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async ({
            id,
            type,
        }: {
            id: number;
            type: 'menu' | 'addon' | 'side';
        }) => { /* ...calls MenuService.deleteMenuItem, etc... */ },
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Item deleted successfully',
                variant: 'default',
            });
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
            // ... invalidate other queries
            setDeleteItem(null);
        },
        onError: (error: Error) => { /* ... */ },
    });
    ```

### 4. Naming Conventions

Strict `camelCase` for variables and functions, `PascalCase` for components, types, and interfaces, and `kebab-case` for custom hooks/CSS files.

*   **Files:**
    *   Components/Pages: `Dashboard.tsx`, `Menu.tsx` (PascalCase)
    *   Services: `menuService.ts`, `orderService.ts` (camelCase)
    *   Hooks: `use-toast.ts`, `use-mobile.tsx` (kebab-case prefix)
*   **Variables/Functions:** `searchQuery`, `handleEditMenuItem`, `filteredMenuItems` (camelCase)
*   **Components/Interfaces:** `MenuItemCard`, `AddAddonDialog`, `MenuItem`, `MenuCategory` (PascalCase)
*   **Enums:** `OrderItemStatus.PENDING` (PascalCase for enum, UPPER_SNAKE_CASE for members)

### 5. Component Structure

A clear hierarchy and separation between UI primitives, reusable components, and full-page views.

*   **`src/components/ui/`:** Primitive UI components (e.g., `button.tsx`, `card.tsx`, `input.tsx`). These are typically wrappers around `shadcn/ui` and `Radix UI` primitives, highly reusable and presentational, utilizing `cn` for Tailwind class merging.
    ```typescript
    // src/components/ui/button.tsx
    import { cn } from "@/lib/utils";
    // ...
    const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
      ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
      },
    );
    ```
*   **`src/components/layout/`:** Application-wide layout components (`MainLayout.tsx`, `AppSidebar.tsx`). Manage global layout and navigation concerns.
*   **`src/components/dashboard/`:** Domain-specific reusable components (e.g., `StatCard.tsx`, `RevenueChart.tsx`). These are generally presentational or self-contained for a specific view, receiving data via props or internal `useQuery` calls.
    ```typescript
    // src/components/dashboard/StatCard.tsx
    interface StatCardProps {
      title: string;
      value: string;
      change?: string;
      changeType?: "positive" | "negative" | "neutral";
      icon: LucideIcon;
      iconColor?: "primary" | "success" | "warning" | "destructive";
    }
    export function StatCard({ /* ... */ }: StatCardProps) { /* ... */ }
    ```
*   **`src/pages/`:** Top-level application views (e.g., `Dashboard.tsx`, `Menu.tsx`). These orchestrate data fetching, manage page-specific state, and compose smaller components to form the complete UI. They often contain the business logic for the specific page.
    ```typescript
    // src/pages/Menu.tsx (simplified)
    export default function Menu() {
        const [searchQuery, setSearchQuery] = useState('');
        // ... useQuery hooks for menu data
        // ... filtering and grouping logic
        return (
            <MainLayout title='Menu' subtitle='Manage your restaurant menu items'>
                {/* ... UI with MenuItemCard, AddAddonDialog, etc. */}
            </MainLayout>
        );
    }
    ```

### 6. ShadCN UI Integration

The codebase deeply integrates `shadcn/ui` components, often copying their source into `src/components/ui/` to allow for full customization. Styling is managed via Tailwind CSS and the `cn` utility.

*   **Custom Theming:** `tailwind.config.ts` and `src/index.css` define custom CSS variables and utility classes (`glass-card`, `gradient-primary`, `shadow-glow`, `hover-lift`) for a consistent visual identity.

## Part 2: What We'll Find in `stunna` Branch (Expected Anti-patterns)

Based on the previous understanding and common refactoring needs, the `stunna` branch likely deviates from `kibang0`'s standards in several key areas.

*   **Direct API Calls & Manual Fetching:** Instead of using React Query, `stunna` components might perform `fetch` or `axios` calls directly within `useEffect` hooks, leading to:
    *   No automatic caching or revalidation.
    *   Boilerplate code for loading, error, and data states in every component.
    *   Difficulty in managing data consistency across the application.
    *   Example: A component might use `useState` for `data`, `isLoading`, `isError` and then a `useEffect` to fetch:
        ```typescript
        // Example: src/pages/BarReturns.tsx (expected in stunna)
        const [returns, setReturns] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
          const fetchReturns = async () => {
            try {
              const response = await axios.get('/api/bar-returns');
              setReturns(response.data);
            } catch (err) {
              setError(err);
            } finally {
              setLoading(false);
            }
          };
          fetchReturns();
        }, []);
        ```
        *Contrast with `kibang0`'s `useQuery`.*

*   **Hardcoded Data Arrays:** Extensive use of local, hardcoded arrays for data (`const returns = [...]`, `const tables = [...]`) instead of dynamically fetching them from the backend. This limits the application's dynamism and scalability.
    *   Example: `src/pages/BarReturns.tsx` and `src/pages/SettingsTables.tsx` (in `stunna`) having inline `const returns = [...]` and `const tables = [...]`.

*   **Inconsistent Naming Conventions:** Deviations from `camelCase` for variables and functions.
    *   Example: `Bar-Order-Status` (kebab-case) for an enum member instead of `BarOrderStatus.PENDING` (PascalCase.UPPER_SNAKE_CASE). Or `some_variable` (snake_case) instead of `someVariable` (camelCase).

*   **Tight Coupling of Logic and UI:** Business logic (e.g., complex filtering, data transformations, status updates) might be directly interleaved with UI rendering logic within components, making them harder to read, test, and maintain.
    *   Example: Complex `filter` and `map` operations within the JSX rendering logic of a large page component that could be extracted.

*   **Redundant Type Definitions or `any` Usage:** Types might be defined inline multiple times across different files for the same data shape, or `any` might be used liberally due to a lack of proper type management.
    *   Example: An `interface OrderItem` defined in `src/pages/Orders.tsx` and also `src/pages/OrderNew.tsx` instead of a single definition in `src/types/orderTypes.ts`.

*   **Suboptimal Error Handling and User Feedback:** Error messages from API calls might be generic `alert()` calls or simply `console.error` without being gracefully presented to the user via a consistent toast/notification system.

*   **Direct State Updates for Complex Data:** After an API call that modifies data, the `stunna` branch might manually update local `useState` arrays by `map`ping or `filter`ing, which is prone to bugs and less efficient than React Query's `invalidateQueries`.
    *   Example: `setOrders(orders.map(order => { /* ...manual update logic... */ }))` for status changes.

## Part 3: Refactoring Checklist for `stunna` into `kibang0`

This checklist outlines the specific steps required to refactor `stunna` to align with the `kibang0` branch's professional standards.

### General Refactoring Principles
*   **Prioritize Type Safety:** Always start by defining or importing types correctly.
*   **Decouple Concerns:** Separate data fetching and business logic from UI rendering.
*   **Leverage React Query:** Use it for all server state management.
*   **Consistency:** Adhere strictly to naming conventions and folder structures.
*   **User Feedback:** Implement consistent toast messages for all user-facing actions (success, error).

---

### Refactoring Checklist

#### 1. Project-Wide Changes
*   [ ] **TypeScript Conversion:**
    *   [ ] Verify all `.js`/`.jsx` files are converted to `.ts`/`.tsx`.
    *   [ ] Introduce/update all necessary interfaces and types in `src/types/` for shared data structures (e.g., `BarOrder`, `BarOrderItem` -> `OrderTypes`).
    *   [ ] Ensure all component props, state variables, and function arguments/return values have explicit types, avoiding `any`.
*   [ ] **React Query Setup:**
    *   [ ] Confirm `QueryClientProvider` is correctly set up in `src/App.tsx`.
    *   [ ] Ensure `useToast` from `@/hooks/use-toast` is used for all notifications, configured with descriptive titles/messages and appropriate `variant`s (`"default"`, `"destructive"`).
*   [ ] **Naming Conventions Enforcement:**
    *   [ ] Review all file names (`PascalCase.tsx`, `camelCaseService.ts`, `use-kebab-case.ts`).
    *   [ ] Refactor all variable and function names to `camelCase` (e.g., `order_id` -> `orderId`, `handle_click` -> `handleClick`).
    *   [ ] Ensure component and interface names are `PascalCase`.
    *   [ ] Enforce `PascalCase` for enum names and `UPPER_SNAKE_CASE` for enum members.
*   [ ] **Service Layer Adherence:**
    *   [ ] Verify all API calls (`axios.get`, `axios.post`, etc.) are made exclusively through methods defined in `src/services/` (e.g., `MenuService`, `OrderService`).
    *   [ ] Remove any direct `axios` or `fetch` calls from page or component files.

#### 2. Specific File Refactoring Tasks

*   **`src/pages/BarReturns.tsx`:**
    *   [ ] **Data Fetching:** Replace `const returns = [...]` with a `useQuery` call (e.g., `useQuery({ queryKey: ['barReturns'], queryFn: OrderService.getAllBarReturns })`).
    *   [ ] **Status Updates:** Implement `useMutation` for "Remake" and "Resolve" actions (`OrderService.updateReturnStatus`).
        *   [ ] On `onSuccess` of mutation, `queryClient.invalidateQueries({ queryKey: ['barReturns'] })` to re-fetch data.
        *   [ ] Add `isPending` state to buttons to disable during API calls.
    *   [ ] **Type Definition:** Define `BarReturn` interface in `src/types/orderTypes.ts` or `src/types/barTypes.ts` if specific to bar.
    *   [ ] **Dynamic Stats:** Update stats (`pendingCount`, etc.) to derive from `useQuery` data.
*   **`src/pages/KitchenDissatisfactions.tsx`:**
    *   [ ] **Data Fetching:** Replace `const dissatisfactions = [...]` with a `useQuery` call.
    *   [ ] **Status Updates:** Implement `useMutation` for actions.
    *   [ ] **Type Definition:** Define relevant interfaces in `src/types/`.
*   **`src/pages/SettingsTables.tsx`:**
    *   [ ] **Data Fetching:** Replace `const tables = [...]` and `const locations = [...]` with `useQuery` calls (e.g., `TableService.getAllTables()`, `TableService.getLocations()`).
    *   [ ] **Form Management:** Refactor "Add New Table" form to use `useForm` (React Hook Form) with `zodResolver` and a Zod schema for validation.
    *   [ ] **Form Submission:** Implement `useMutation` for adding a new table (`TableService.createTable`).
        *   [ ] On `onSuccess`, `toast.success` and `queryClient.invalidateQueries` for tables.
        *   [ ] On `onError`, `toast.destructive`.
*   **`src/pages/RoleNew.tsx`, `src/pages/StaffNew.tsx`, `src/pages/UserNew.tsx`, `src/pages/ReservationNew.tsx`, `src/pages/PurchaseOrderNew.tsx`:**
    *   [ ] **Data Population:** Replace any hardcoded lists (e.g., `permissionGroups`, `suppliers`, `inventoryItems`) with data fetched via `useQuery` and appropriate services (e.g., `UserService.getAllRoles()`, `SupplierService.getAllSuppliers()`, `InventoryService.getAllItems()`).
    *   [ ] **Form Management:** Implement `useForm` (React Hook Form) with `zodResolver` and a Zod schema for all forms.
    *   [ ] **Form Submission:** Implement `useMutation` for form submissions (e.g., `UserService.createUser()`, `SupplierService.createSupplier()`, `ReservationService.createReservation()`, `PurchaseService.createPurchaseOrder()`).
        *   [ ] Handle `onSuccess` (toast, navigation, query invalidation) and `onError` (toast).
        *   [ ] Add `isPending` states to submit buttons.
*   **`src/pages/KitchenInventory.tsx`, `src/pages/BarInventory.tsx`:**
    *   [ ] **Data Fetching:** Replace `inventoryItems` and `requestItems` with `useQuery` calls to respective services (`InventoryService.getAllItems()`, `InventoryService.getAllRequests()`).
    *   [ ] **Inventory Updates:** Implement `useMutation` for "Update Inventory Usage" and "Create Stock Request."
        *   [ ] Ensure mutations invalidate relevant queries on success.
    *   [ ] **Autocomplete:** If autocomplete uses local data, integrate `useQuery` for suggestions.
*   **`src/components/menu/AddSideDishDialog.tsx`, `src/components/menu/AddAddonDialog.tsx`:**
    *   [ ] **Form Submission:** Refactor to use `useMutation` (e.g., `MenuService.createMenuSideDish()`, `MenuService.createMenuAddon()`) with `onSuccess` (toast, query invalidation).
    *   [ ] **State Management:** Remove local `useState` for name, description, price, isAvailable, and bind them to form fields managed by `useForm`.
*   **`src/pages/BarMenu.tsx`, `src/pages/KitchenMenu.tsx`:**
    *   [ ] **Unified Data Model:** Ensure these pages consistently use the `MenuItem`, `MenuAddon`, `MenuSideDish`, `MenuCategory` types from `src/types/menuType.ts`.
    *   [ ] **CRUD Operations:** Verify that all data modification actions (toggle availability, edit, delete) use `useMutation` with proper `onSuccess` and `onError` handlers that invalidate `menuItems`, `menuAddons`, `menuSideDishes`, and `menuCategories` queries.
    *   [ ] **Error/Loading States:** Ensure global `isLoading` and `error` states from `useQuery` hooks are properly handled to show loading spinners or error messages.
*   **`src/pages/Orders.tsx`:**
    *   [ ] **Data Fetching:** Replace `mockOrders` with `OrderService.getRecentOrders()` via `useQuery`.
    *   [ ] **Order/Item Status Updates:** Use `useMutation` for `handleStatusUpdate`, `handleCancelOrder`, and individual item cancellations.
        *   [ ] Ensure `onSuccess` callbacks `queryClient.invalidateQueries` for relevant orders.
    *   [ ] **Order Details Modal:** Ensure `selectedOrder` in the dialog is properly typed and rendered from fetched data, not mock data.
    *   [ ] **Link to Payment:** Verify that the "Record Payment" action navigates to `/order/:id/pay` correctly, passing the order ID.
*   **`src/pages/OrderNew.tsx`:**
    *   [ ] **Menu Item Selection:** Ensure menu item data is fetched via `MenuService.getAllMenuItems()` using `useQuery`.
    *   [ ] **Side Dish/Addon Selection:** Ensure `sideDishes` and `addons` data is fetched via `MenuService.getAllMenuSideDishes()` and `MenuService.getAllMenuAddons()` using `useQuery`.
    *   [ ] **Order Creation:** Use `OrderService.createOrder()` via `useMutation` for submitting the new order.
    *   [ ] **Validation:** Implement client-side validation for form fields before submitting.
*   **`src/pages/KitchenOrders.tsx`:**
    *   [ ] **Real-time Updates:** Confirm `refetchInterval` is used on `useQuery` for kitchen orders to provide real-time updates.
    *   [ ] **Status Management:** Ensure `updateItemStatusMutation` and `updateKitchenOrderStatusMutation` handle all status transitions correctly, invalidating necessary queries (`queryClient.invalidateQueries`) and ensuring parent order status is updated if all child items are ready.
    *   [ ] **Optimistic Updates (`onMutate`):** Review if optimistic updates are beneficial for quick UI feedback for item status changes.
    *   [ ] **Type Consistency:** Ensure `KitchenOrderStatus`, `OrderItemStatus`, `MenuAddon`, `MenuSideDish`, `MenuItem`, `OrderItem`, `KitchenOrder` interfaces are correctly defined in `src/types/orderTypes.ts` and used throughout.
    *   [ ] **Helper Functions:** Ensure helper functions like `getOrderStatus`, `getCourseFromItems`, `getPriorityFromItems`, `getTimeAgo` are well-typed and correctly integrated.

---
