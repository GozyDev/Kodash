"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/superbase/superbase-server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/error?msg=${error.message}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// app/actions/signup.ts (server action)

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    // keep simple: send user to an error page
    redirect(`/error?msg=${error.message}`);
  } else {
    redirect(`/comfirm_email?eml=${data.user?.email}`);
  }

  // optional: immediately create a lightweight profile row (no tenant yet)
  // OR you can wait until the user finishes Create Organization form
  // If you want to create a tenant immediately, call your secure API here:
  // await fetch('/api/create-tenant', { method: 'POST', body: JSON.stringify({ userId: data.user?.id }) })

  // redirect user to create-organization page (your desired flow)
  //   redirect("/create-organization");
}


