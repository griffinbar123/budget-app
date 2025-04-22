create sequence "public"."categories_id_seq";

create sequence "public"."income_plans_id_seq";

create sequence "public"."income_sources_id_seq";

create sequence "public"."transactions_id_seq";

create sequence "public"."user_category_mappings_id_seq";

create table "public"."categories" (
    "id" integer not null default nextval('categories_id_seq'::regclass),
    "user_id" uuid not null,
    "name" character varying(255) not null,
    "type" character varying(50) not null,
    "planned_amount" numeric(10,2) default 0.00
);


alter table "public"."categories" enable row level security;

create table "public"."income_plans" (
    "id" integer not null default nextval('income_plans_id_seq'::regclass),
    "user_id" uuid not null,
    "source_id" integer not null,
    "planned_amount" numeric(10,2) not null
);


alter table "public"."income_plans" enable row level security;

create table "public"."income_sources" (
    "id" integer not null default nextval('income_sources_id_seq'::regclass),
    "user_id" uuid not null,
    "name" character varying(255) not null
);


alter table "public"."income_sources" enable row level security;

create table "public"."transactions" (
    "id" integer not null default nextval('transactions_id_seq'::regclass),
    "user_id" uuid not null,
    "account_id" text,
    "date" date not null,
    "description" text not null,
    "amount" numeric(10,2) not null,
    "type" character varying(50) not null,
    "category_id" integer,
    "source_id" integer,
    "plaid_category_id" text,
    "plaid_transaction_id" text,
    "from_account_id" text,
    "to_account_id" text
);


alter table "public"."transactions" enable row level security;

create table "public"."user_category_mappings" (
    "id" integer not null default nextval('user_category_mappings_id_seq'::regclass),
    "user_id" uuid not null,
    "plaid_category_id" text not null,
    "user_category_id" integer
);


alter table "public"."user_category_mappings" enable row level security;

alter sequence "public"."categories_id_seq" owned by "public"."categories"."id";

alter sequence "public"."income_plans_id_seq" owned by "public"."income_plans"."id";

alter sequence "public"."income_sources_id_seq" owned by "public"."income_sources"."id";

alter sequence "public"."transactions_id_seq" owned by "public"."transactions"."id";

alter sequence "public"."user_category_mappings_id_seq" owned by "public"."user_category_mappings"."id";

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX categories_user_id_name_key ON public.categories USING btree (user_id, name);

CREATE UNIQUE INDEX income_plans_pkey ON public.income_plans USING btree (id);

CREATE UNIQUE INDEX income_sources_pkey ON public.income_sources USING btree (id);

CREATE UNIQUE INDEX income_sources_user_id_name_key ON public.income_sources USING btree (user_id, name);

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

CREATE UNIQUE INDEX transactions_plaid_transaction_id_key ON public.transactions USING btree (plaid_transaction_id);

CREATE UNIQUE INDEX user_category_mappings_pkey ON public.user_category_mappings USING btree (id);

CREATE UNIQUE INDEX user_category_mappings_user_id_plaid_category_id_key ON public.user_category_mappings USING btree (user_id, plaid_category_id);

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."income_plans" add constraint "income_plans_pkey" PRIMARY KEY using index "income_plans_pkey";

alter table "public"."income_sources" add constraint "income_sources_pkey" PRIMARY KEY using index "income_sources_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."user_category_mappings" add constraint "user_category_mappings_pkey" PRIMARY KEY using index "user_category_mappings_pkey";

alter table "public"."categories" add constraint "categories_type_check" CHECK (((type)::text = ANY (ARRAY[('expense'::character varying)::text, ('reserve'::character varying)::text]))) not valid;

alter table "public"."categories" validate constraint "categories_type_check";

alter table "public"."categories" add constraint "categories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."categories" validate constraint "categories_user_id_fkey";

alter table "public"."categories" add constraint "categories_user_id_name_key" UNIQUE using index "categories_user_id_name_key";

alter table "public"."income_plans" add constraint "income_plans_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."income_plans" validate constraint "income_plans_user_id_fkey";

alter table "public"."income_sources" add constraint "income_sources_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."income_sources" validate constraint "income_sources_user_id_fkey";

alter table "public"."income_sources" add constraint "income_sources_user_id_name_key" UNIQUE using index "income_sources_user_id_name_key";

alter table "public"."transactions" add constraint "transactions_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) not valid;

alter table "public"."transactions" validate constraint "transactions_category_id_fkey";

alter table "public"."transactions" add constraint "transactions_plaid_transaction_id_key" UNIQUE using index "transactions_plaid_transaction_id_key";

alter table "public"."transactions" add constraint "transactions_source_id_fkey" FOREIGN KEY (source_id) REFERENCES income_sources(id) not valid;

alter table "public"."transactions" validate constraint "transactions_source_id_fkey";

alter table "public"."transactions" add constraint "transactions_type_check" CHECK (((type)::text = ANY (ARRAY[('expense'::character varying)::text, ('income'::character varying)::text, ('transfer'::character varying)::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_type_check";

alter table "public"."transactions" add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_fkey";

alter table "public"."user_category_mappings" add constraint "user_category_mappings_user_category_id_fkey" FOREIGN KEY (user_category_id) REFERENCES categories(id) ON DELETE SET NULL not valid;

alter table "public"."user_category_mappings" validate constraint "user_category_mappings_user_category_id_fkey";

alter table "public"."user_category_mappings" add constraint "user_category_mappings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_category_mappings" validate constraint "user_category_mappings_user_id_fkey";

alter table "public"."user_category_mappings" add constraint "user_category_mappings_user_id_plaid_category_id_key" UNIQUE using index "user_category_mappings_user_id_plaid_category_id_key";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."income_plans" to "anon";

grant insert on table "public"."income_plans" to "anon";

grant references on table "public"."income_plans" to "anon";

grant select on table "public"."income_plans" to "anon";

grant trigger on table "public"."income_plans" to "anon";

grant truncate on table "public"."income_plans" to "anon";

grant update on table "public"."income_plans" to "anon";

grant delete on table "public"."income_plans" to "authenticated";

grant insert on table "public"."income_plans" to "authenticated";

grant references on table "public"."income_plans" to "authenticated";

grant select on table "public"."income_plans" to "authenticated";

grant trigger on table "public"."income_plans" to "authenticated";

grant truncate on table "public"."income_plans" to "authenticated";

grant update on table "public"."income_plans" to "authenticated";

grant delete on table "public"."income_plans" to "service_role";

grant insert on table "public"."income_plans" to "service_role";

grant references on table "public"."income_plans" to "service_role";

grant select on table "public"."income_plans" to "service_role";

grant trigger on table "public"."income_plans" to "service_role";

grant truncate on table "public"."income_plans" to "service_role";

grant update on table "public"."income_plans" to "service_role";

grant delete on table "public"."income_sources" to "anon";

grant insert on table "public"."income_sources" to "anon";

grant references on table "public"."income_sources" to "anon";

grant select on table "public"."income_sources" to "anon";

grant trigger on table "public"."income_sources" to "anon";

grant truncate on table "public"."income_sources" to "anon";

grant update on table "public"."income_sources" to "anon";

grant delete on table "public"."income_sources" to "authenticated";

grant insert on table "public"."income_sources" to "authenticated";

grant references on table "public"."income_sources" to "authenticated";

grant select on table "public"."income_sources" to "authenticated";

grant trigger on table "public"."income_sources" to "authenticated";

grant truncate on table "public"."income_sources" to "authenticated";

grant update on table "public"."income_sources" to "authenticated";

grant delete on table "public"."income_sources" to "service_role";

grant insert on table "public"."income_sources" to "service_role";

grant references on table "public"."income_sources" to "service_role";

grant select on table "public"."income_sources" to "service_role";

grant trigger on table "public"."income_sources" to "service_role";

grant truncate on table "public"."income_sources" to "service_role";

grant update on table "public"."income_sources" to "service_role";

grant delete on table "public"."transactions" to "anon";

grant insert on table "public"."transactions" to "anon";

grant references on table "public"."transactions" to "anon";

grant select on table "public"."transactions" to "anon";

grant trigger on table "public"."transactions" to "anon";

grant truncate on table "public"."transactions" to "anon";

grant update on table "public"."transactions" to "anon";

grant delete on table "public"."transactions" to "authenticated";

grant insert on table "public"."transactions" to "authenticated";

grant references on table "public"."transactions" to "authenticated";

grant select on table "public"."transactions" to "authenticated";

grant trigger on table "public"."transactions" to "authenticated";

grant truncate on table "public"."transactions" to "authenticated";

grant update on table "public"."transactions" to "authenticated";

grant delete on table "public"."transactions" to "service_role";

grant insert on table "public"."transactions" to "service_role";

grant references on table "public"."transactions" to "service_role";

grant select on table "public"."transactions" to "service_role";

grant trigger on table "public"."transactions" to "service_role";

grant truncate on table "public"."transactions" to "service_role";

grant update on table "public"."transactions" to "service_role";

grant delete on table "public"."user_category_mappings" to "anon";

grant insert on table "public"."user_category_mappings" to "anon";

grant references on table "public"."user_category_mappings" to "anon";

grant select on table "public"."user_category_mappings" to "anon";

grant trigger on table "public"."user_category_mappings" to "anon";

grant truncate on table "public"."user_category_mappings" to "anon";

grant update on table "public"."user_category_mappings" to "anon";

grant delete on table "public"."user_category_mappings" to "authenticated";

grant insert on table "public"."user_category_mappings" to "authenticated";

grant references on table "public"."user_category_mappings" to "authenticated";

grant select on table "public"."user_category_mappings" to "authenticated";

grant trigger on table "public"."user_category_mappings" to "authenticated";

grant truncate on table "public"."user_category_mappings" to "authenticated";

grant update on table "public"."user_category_mappings" to "authenticated";

grant delete on table "public"."user_category_mappings" to "service_role";

grant insert on table "public"."user_category_mappings" to "service_role";

grant references on table "public"."user_category_mappings" to "service_role";

grant select on table "public"."user_category_mappings" to "service_role";

grant trigger on table "public"."user_category_mappings" to "service_role";

grant truncate on table "public"."user_category_mappings" to "service_role";

grant update on table "public"."user_category_mappings" to "service_role";


