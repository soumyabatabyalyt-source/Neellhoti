"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

import {
  motion,
  AnimatePresence,
} from "framer-motion"

import {
  Globe,
  ExternalLink,
  Hash,
} from "lucide-react"

type TaskRow = {
  id: string

  task_code?: string | null

  // TYPES
  task_type?: string | null

  // POST TASK
  subreddit?: string | null
  flair?: string | null
  body?: string | null
  image_link?: string | null

  // COMMENT TASK
  post_link?: string | null
  comment_type?: string | null

  // COMMON
  reward?: number | string | null
  time_limit?: number | null
}

export default function TasksPage() {

  const [tasks, setTasks] =
    useState<TaskRow[]>([])

  const [loading, setLoading] =
    useState(true)

  const [claiming, setClaiming] =
    useState<string | null>(null)

  const [errorMsg, setErrorMsg] =
    useState("")

  const [cooldownMsg, setCooldownMsg] =
    useState("")

  // =========================================
  // FETCH TASKS
  // =========================================

  const fetchTasks = useCallback(async () => {

    setLoading(true)

    setErrorMsg("")

    setCooldownMsg("")

    // SESSION
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {

      setErrorMsg("Login required")

      setTasks([])

      setLoading(false)

      return
    }

    // PROFILE
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(`
        approved,
        suspended,
        cooldown_until
      `)
      .eq("id", session.user.id)
      .single()

    if (
      profileError ||
      !profile
    ) {

      setErrorMsg(
        "Profile fetch failed"
      )

      setTasks([])

      setLoading(false)

      return
    }

    // APPROVED
    if (!profile.approved) {

      setErrorMsg(
        "Await manager approval"
      )

      setTasks([])

      setLoading(false)

      return
    }

    // SUSPENDED
    if (profile.suspended) {

      setErrorMsg(
        "Account suspended"
      )

      setTasks([])

      setLoading(false)

      return
    }

    // COOLDOWN
    if (
      profile.cooldown_until &&
      new Date(
        profile.cooldown_until
      ) > new Date()
    ) {

      const remainingMs =
        new Date(
          profile.cooldown_until
        ).getTime() - Date.now()

      const totalMinutes =
        Math.ceil(
          remainingMs / 60000
        )

      const hours =
        Math.floor(
          totalMinutes / 60
        )

      const minutes =
        totalMinutes % 60

      setCooldownMsg(
        `Cooldown active: ${hours}h ${minutes}m remaining`
      )
    }

    // FETCH TASKS
    const res = await fetch(
      "/api/tasks",
      {
        headers: {
          Authorization:
            `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      }
    )

    const payload =
      await res.json()

    if (!res.ok) {

      setErrorMsg(
        payload.error ||
        "Failed to load tasks"
      )

      setTasks([])

    } else {

      setTasks(
        payload.tasks || []
      )
    }

    setLoading(false)

  }, [])

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    void fetchTasks()

  }, [fetchTasks])

  // =========================================
  // CLAIM TASK
  // =========================================

  async function claimTask(
    taskId: string
  ) {

    setClaiming(taskId)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {

      alert("Login required")

      setClaiming(null)

      return
    }

    const res = await fetch(
      "/api/claim-task",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          task_id: taskId,
        }),
      }
    )

    const payload =
      await res.json()

    if (!res.ok) {

      alert(
        payload.error ||
        "Claim failed"
      )

      setClaiming(null)

      await fetchTasks()

      return
    }

    alert("Task claimed ✅")

    setClaiming(null)

    await fetchTasks()
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="
        max-w-5xl
        mx-auto
        p-6
        md:p-8
        w-full
      ">

        <div className="
          h-8
          w-48
          bg-white/5
          rounded-lg
          animate-pulse
          mb-8
        " />

        <div className="grid gap-4">

          {[1, 2, 3].map((i) => (

            <div
              key={i}
              className="
                border
                border-white/5
                bg-white/[0.02]
                rounded-2xl
                p-6
                h-40
                animate-pulse
              "
            />
          ))}

        </div>

      </div>
    )
  }

  // =========================================
  // ERROR
  // =========================================

  if (errorMsg) {

    return (

      <div className="
        max-w-5xl
        mx-auto
        p-6
        md:p-8
        w-full
        flex
        items-center
        justify-center
        min-h-[50vh]
      ">

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="
            bg-red-500/10
            border
            border-red-500/20
            text-red-400
            p-6
            rounded-2xl
            max-w-md
            text-center
          "
        >

          <p className="
            font-medium
            text-lg
          ">
            {errorMsg}
          </p>

        </motion.div>

      </div>
    )
  }

  // =========================================
  // MAIN UI
  // =========================================

  return (

    <div className="
      max-w-5xl
      mx-auto
      p-6
      md:p-8
      w-full
      font-sans
    ">

      {/* HEADER */}
      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          flex
          items-center
          justify-between
          mb-8
        "
      >

        <div>

          <h1 className="
            text-3xl
            font-bold
            text-white
            tracking-tight
          ">
            Task Pool
          </h1>

          <p className="
            text-slate-400
            mt-1
            text-sm
          ">
            Browse and claim available tasks to earn rewards.
          </p>

        </div>

      </motion.div>

      {/* COOLDOWN */}
      <AnimatePresence>

        {cooldownMsg && (

          <motion.div
            initial={{
              opacity: 0,
              height: 0,
              marginBottom: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
              marginBottom: 24,
            }}
            exit={{
              opacity: 0,
              height: 0,
              marginBottom: 0,
            }}
            className="overflow-hidden"
          >

            <div className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-amber-500/30
              bg-amber-500/10
              px-5
              py-4
              text-amber-300
            ">

              <span className="
                font-medium
              ">
                {cooldownMsg}
              </span>

            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* EMPTY */}
      {tasks.length === 0 ? (

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="
            border-2
            border-dashed
            border-white/10
            rounded-3xl
            p-12
            flex
            flex-col
            items-center
            justify-center
            text-center
            bg-white/[0.01]
          "
        >

          <h3 className="
            text-xl
            font-semibold
            text-white
            mb-2
          ">
            No tasks available
          </h3>

          <p className="
            text-slate-400
            max-w-sm
          ">
            You're all caught up! Check back later for new tasks.
          </p>

        </motion.div>

      ) : (

        <motion.div
          className="grid gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {
              opacity: 0,
            },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >

          {tasks.map((task) => {

            const isComment =
              task.task_type ===
              "comment"

            const isPost =
              task.task_type ===
              "post"

            return (

              <motion.div
                key={task.id}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                className="
                  group
                  relative
                  border
                  border-white/5
                  bg-white/[0.02]
                  hover:bg-white/[0.04]
                  backdrop-blur-xl
                  rounded-3xl
                  p-7
                  flex
                  flex-col
                  md:flex-row
                  md:justify-between
                  md:items-start
                  gap-6
                  transition-all
                  duration-300
                  hover:border-white/10
                  hover:shadow-xl
                "
              >

                {/* LEFT */}
                <div className="
                  flex-1
                  pr-4
                ">

                  {/* TASK ID */}
                  <div className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-full
                    bg-black/30
                    border
                    border-white/10
                    text-xs
                    font-mono
                    tracking-wide
                    mb-5
                  ">

                    <Hash
                      size={12}
                    />

                    <span className="
                      text-slate-500
                    ">
                      TASK ID
                    </span>

                    <span className="
                      text-white
                      font-semibold
                    ">
                      {task.task_code || task.id}
                    </span>

                  </div>

                  {/* TYPE */}
                  <p className="
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-slate-500
                    mb-3
                  ">

                    {isComment
                      ? "Comment Task"
                      : "Post Task"}

                  </p>

                  {/* TITLE */}
                  <h2 className="
                    font-semibold
                    text-2xl
                    text-white
                    tracking-tight
                    group-hover:text-red-400
                    transition-colors
                  ">

                    {isComment
                      ? task.comment_type ||
                        "Comment Task"
                      : "Post Task"}

                  </h2>

                  {/* COMMENT TASK */}
                  {isComment && (

                    <div className="
                      mt-5
                      space-y-4
                    ">

                      <a
                        href={
                          task.post_link ||
                          "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          inline-flex
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          border-blue-500/20
                          bg-blue-500/10
                          px-5
                          py-3
                          text-blue-300
                          hover:bg-blue-500/20
                          transition-all
                          font-medium
                        "
                      >

                        <div className="
                          w-9
                          h-9
                          rounded-full
                          bg-[#FF4500]
                          flex
                          items-center
                          justify-center
                          text-white
                          font-bold
                        ">
                          r
                        </div>

                        <div>

                          <p className="
                            text-white
                            font-semibold
                          ">
                            Open Reddit Post
                          </p>

                          <p className="
                            text-blue-200/70
                            text-xs
                          ">
                            View target thread
                          </p>

                        </div>

                      </a>

                      <div>

                        <p className="
                          text-sm
                          text-slate-500
                          mb-1
                        ">
                          Comment Type
                        </p>

                        <p className="
                          text-slate-300
                        ">

                          {task.comment_type ||
                            "Comment"}

                        </p>

                      </div>

                      <p className="
                        text-sm
                        text-slate-500
                      ">
                        Comment content unlocks after claiming.
                      </p>

                    </div>
                  )}

                  {/* POST TASK */}
                  {isPost && (

                    <div className="
                      mt-5
                      space-y-4
                    ">

                      <a
                        href={
                          task.subreddit?.startsWith("http")
                            ? task.subreddit
                            : `https://reddit.com/${task.subreddit || ""}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          inline-flex
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          border-orange-500/20
                          bg-orange-500/10
                          px-5
                          py-3
                          text-orange-300
                          hover:bg-orange-500/20
                          transition-all
                          font-medium
                        "
                      >

                        <div className="
                          w-9
                          h-9
                          rounded-full
                          bg-[#FF4500]
                          flex
                          items-center
                          justify-center
                          text-white
                          font-bold
                        ">
                          r
                        </div>

                        <div>

                          <p className="
                            text-white
                            font-semibold
                          ">
                            {task.subreddit}
                          </p>

                          <p className="
                            text-orange-200/70
                            text-xs
                          ">
                            Open subreddit
                          </p>

                        </div>

                      </a>

                      <p className="
                        text-sm
                        text-slate-500
                      ">
                        Post details unlock after claiming.
                      </p>

                    </div>
                  )}

                  {/* REWARD */}
                  {task.reward != null && (

                    <div className="
                      mt-6
                      inline-flex
                      items-center
                      gap-1.5
                      bg-emerald-500/10
                      border
                      border-emerald-500/20
                      px-4
                      py-2
                      rounded-xl
                    ">

                      <span className="
                        text-sm
                        text-emerald-400
                        font-semibold
                        tracking-wide
                      ">
                        Reward: ${task.reward}
                      </span>

                    </div>
                  )}

                </div>

                {/* BUTTON */}
                <button
                  onClick={() =>
                    claimTask(task.id)
                  }
                  disabled={
                    claiming ===
                    task.id
                  }
                  className="
                    shrink-0
                    bg-gradient-to-r
                    from-red-500
                    to-rose-600
                    hover:from-red-400
                    hover:to-rose-500
                    transition-all
                    text-white
                    px-8
                    py-3
                    rounded-2xl
                    font-semibold
                    shadow-lg
                    shadow-red-500/20
                    hover:shadow-red-500/40
                    disabled:opacity-50
                    disabled:pointer-events-none
                    min-w-[150px]
                    flex
                    justify-center
                    items-center
                    gap-2
                  "
                >

                  {claiming ===
                  task.id ? (

                    <span>
                      Claiming...
                    </span>

                  ) : (

                    "Claim Task"
                  )}

                </button>

              </motion.div>
            )
          })}

        </motion.div>
      )}

    </div>
  )
}