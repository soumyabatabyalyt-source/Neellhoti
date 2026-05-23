"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type TaskRow = {
  id: string
  task_code?: string | null

  title?: string | null
  body?: string | null

  task_type?: string | null

  subreddit?: string | null
  flair?: string | null
  image_link?: string | null

  post_link?: string | null
  comment_type?: string | null

  reward?: number | string | null
  time_limit?: number | null
}

export default function TaskPool() {

  const [tasks, setTasks] =
    useState<TaskRow[]>([])

  const [loading, setLoading] =
    useState(true)

  const [errorMsg, setErrorMsg] =
    useState("")

  // =========================================
  // FETCH TASKS
  // =========================================

  useEffect(() => {

    fetch("/api/check-expired-tasks")

    const fetchTasks = async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {

        setErrorMsg("Login required")

        setLoading(false)

        return
      }

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

      } else {

        setTasks(
          payload.tasks || []
        )
      }

      setLoading(false)
    }

    fetchTasks()

  }, [])

  // =========================================
  // CLAIM
  // =========================================

  const handleClaim = async (
    taskId: string
  ) => {

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {

        alert("Login required")

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

      const data =
        await res.json()

      if (!res.ok) {

        alert(
          data.error ||
          "Failed to claim"
        )

        return
      }

      setTasks((prev) =>
        prev.filter(
          (t) =>
            t.id !== taskId
        )
      )

      alert("Task claimed!")

    } catch (err) {

      console.error(err)

      alert(
        "Something went wrong"
      )
    }
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (
      <div className="
        flex
        items-center
        justify-center
        py-24
        text-zinc-400
      ">
        Loading tasks...
      </div>
    )
  }

  // =========================================
  // ERROR
  // =========================================

  if (errorMsg) {

    return (
      <div className="
        bg-red-500/10
        border
        border-red-500/20
        rounded-3xl
        p-8
        text-center
        text-red-400
      ">
        {errorMsg}
      </div>
    )
  }

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div>

        <h1 className="
          text-4xl
          font-bold
        ">
          Task Pool
        </h1>

        <p className="
          text-zinc-400
          mt-2
        ">
          Browse and claim available tasks to earn rewards.
        </p>

      </div>

      {/* EMPTY */}
      {tasks.length === 0 && (

        <div className="
          bg-white/5
          border
          border-white/10
          rounded-3xl
          p-8
          text-center
          text-zinc-400
        ">
          No tasks available
        </div>
      )}

      {/* TASKS */}
      {tasks.map((task) => {

        const isComment =
          task.task_type ===
          "comment"

        const isPost =
          task.task_type ===
          "post"

        return (

          <div
            key={task.id}
            className="
              bg-white/[0.03]
              border
              border-white/10
              rounded-3xl
              p-8
              transition-all
              hover:border-white/20
            "
          >

            {/* TOP */}
            <div className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-4
              mb-6
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
                text-sm
                font-mono
                tracking-wide
              ">

                <span className="
                  text-zinc-500
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

              {/* TYPE BADGE */}
              <div className={`
                px-4
                py-2
                rounded-full
                text-xs
                uppercase
                tracking-[0.2em]
                border

                ${
                  isComment
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                    : "bg-orange-500/10 border-orange-500/20 text-orange-300"
                }
              `}>

                {isComment
                  ? "Comment Task"
                  : "Post Task"}

              </div>

            </div>

            {/* MAIN */}
            <div className="
              flex
              items-start
              justify-between
              gap-6
              flex-col
              lg:flex-row
            ">

              {/* LEFT */}
              <div className="
                flex-1
                min-w-0
              ">

                {/* COMMENT TASK */}
                {isComment && (

                  <div className="
                    space-y-5
                  ">

                    {/* POST LINK */}
                    <div>

                      <p className="
                        text-zinc-500
                        text-sm
                        mb-3
                      ">
                        Reddit Post
                      </p>

                      {task.post_link ? (

                        <a
                          href={task.post_link}
                          target="_blank"
                          rel="noreferrer"
                          className="
                            inline-flex
                            items-center
                            gap-3
                            px-4
                            py-3
                            rounded-2xl
                            bg-blue-500/10
                            border
                            border-blue-500/20
                            hover:border-blue-500/40
                            transition-all
                          "
                        >

                          {/* REDDIT ICON */}
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
                            text-sm
                          ">
                            r
                          </div>

                          <div>

                            <p className="
                              text-white
                              font-medium
                            ">
                              Open Reddit Post
                            </p>

                            <p className="
                              text-zinc-400
                              text-xs
                            ">
                              View target thread
                            </p>

                          </div>

                        </a>

                      ) : (

                        <p className="
                          text-zinc-400
                        ">
                          No post link
                        </p>
                      )}

                    </div>

                    {/* COMMENT TYPE */}
                    <div>

                      <p className="
                        text-zinc-500
                        text-sm
                        mb-2
                      ">
                        Comment Type
                      </p>

                      <div className="
                        inline-flex
                        px-4
                        py-2
                        rounded-xl
                        bg-white/5
                        border
                        border-white/10
                        text-white
                      ">

                        {task.comment_type ||
                          "Comment"}

                      </div>

                    </div>

                    <p className="
                      text-zinc-500
                      text-sm
                    ">
                      Comment content unlocks after claiming.
                    </p>

                  </div>
                )}

                {/* POST TASK */}
                {isPost && (

                  <div className="
                    space-y-5
                  ">

                    {/* SUBREDDIT */}
                    <div>

                      <p className="
                        text-zinc-500
                        text-sm
                        mb-3
                      ">
                        Target Subreddit
                      </p>

                      <a
                        href={
                          task.subreddit?.startsWith("http")
                            ? task.subreddit
                            : `https://reddit.com/${task.subreddit}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="
                          inline-flex
                          items-center
                          gap-3
                          px-4
                          py-3
                          rounded-2xl
                          bg-orange-500/10
                          border
                          border-orange-500/20
                          hover:border-orange-500/40
                          transition-all
                        "
                      >

                        {/* REDDIT ICON */}
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
                          text-sm
                        ">
                          r
                        </div>

                        <div>

                          <p className="
                            text-white
                            font-semibold
                          ">
                            {task.subreddit ||
                              "Unknown subreddit"}
                          </p>

                          <p className="
                            text-zinc-400
                            text-xs
                          ">
                            Open subreddit
                          </p>

                        </div>

                      </a>

                    </div>

                    <p className="
                      text-zinc-500
                      text-sm
                    ">
                      Post details unlock after claiming.
                    </p>

                  </div>
                )}

              </div>

              {/* RIGHT */}
              <div className="
                shrink-0
                text-right
                lg:min-w-[140px]
              ">

                <div className="
                  text-4xl
                  font-bold
                  text-green-400
                ">
                  ${task.reward || 0}
                </div>

                <p className="
                  text-zinc-500
                  text-sm
                  mt-3
                ">
                  {task.time_limit || 0} mins
                </p>

              </div>

            </div>

            {/* CLAIM BUTTON */}
            <button
              onClick={() =>
                handleClaim(task.id)
              }
              className="
                mt-8
                w-full
                rounded-2xl
                bg-gradient-to-r
                from-red-500
                to-rose-500
                hover:from-red-600
                hover:to-rose-600
                transition-all
                py-4
                font-semibold
                text-lg
                shadow-lg
                shadow-red-500/20
              "
            >
              Claim Task
            </button>

          </div>
        )
      })}

    </div>
  )
}