import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest
) {

  try {

    const body =
      await req.json()

    const {
      email,
      password,
      username,
      reddit,
      discord,
    } = body

    // =========================================
    // VALIDATION
    // =========================================

    if (
      !email ||
      !password ||
      !username ||
      !reddit ||
      !discord
    ) {

      return NextResponse.json(
        {
          error:
            "All fields are required",
        },
        { status: 400 }
      )
    }

    // =========================================
    // CHECK DUPLICATE USERNAME
    // =========================================

    const {
      data: existingUsername,
    } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle()

    if (existingUsername) {

      return NextResponse.json(
        {
          error:
            "Username already taken",
        },
        { status: 400 }
      )
    }

    // =========================================
    // CHECK DUPLICATE REDDIT
    // =========================================

    const {
      data: existingReddit,
    } = await supabase
      .from("profiles")
      .select("id")
      .eq("reddit", reddit)
      .maybeSingle()

    if (existingReddit) {

      return NextResponse.json(
        {
          error:
            "Reddit account already used",
        },
        { status: 400 }
      )
    }

    // =========================================
    // CREATE AUTH USER
    // =========================================

    const {
      data: authData,
      error: authError,
    } =
      await supabase.auth.admin.createUser({

        email,
        password,

        email_confirm: true,
      })

    if (authError) {

      return NextResponse.json(
        {
          error:
            authError.message,
        },
        { status: 500 }
      )
    }

    const user =
      authData.user

    if (!user) {

      return NextResponse.json(
        {
          error:
            "User creation failed",
        },
        { status: 500 }
      )
    }

    // =========================================
    // CREATE PROFILE
    // =========================================

    const {
      error: profileError,
    } = await supabase
      .from("profiles")
      .insert({

        id: user.id,

        email,

        username,

        reddit,

        discord,

        role: "user",

        approved: false,

        suspended: false,
      })

    // =========================================
    // ROLLBACK IF PROFILE FAILS
    // =========================================

    if (profileError) {

      // delete broken auth user
      await supabase.auth.admin.deleteUser(
        user.id
      )

      return NextResponse.json(
        {
          error:
            profileError.message,
        },
        { status: 500 }
      )
    }

    // =========================================
    // SUCCESS
    // =========================================

    return NextResponse.json({
      success: true,
    })

  } catch (err: any) {

    console.error(
      "SIGNUP API ERROR:",
      err
    )

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      { status: 500 }
    )
  }
}