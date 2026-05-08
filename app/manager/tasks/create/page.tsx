"use client"

import { useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function CreateTaskPage() {

  const [loading, setLoading] =
    useState(false)

  const [taskType, setTaskType] =
    useState("post")

  // =========================================
  // TASK ID SYSTEM
  // =========================================

  const [clientCode, setClientCode] =
    useState("A")

  const [taskNumber, setTaskNumber] =
    useState("1001")

  // POST TASK
  const [subreddit, setSubreddit] =
    useState("")

  const [title, setTitle] =
    useState("")

  const [flair, setFlair] =
    useState("")

  const [body, setBody] =
    useState("")

  const [imageLink, setImageLink] =
    useState("")

  // COMMENT TASK
  const [postLink, setPostLink] =
    useState("")

  const [commentType, setCommentType] =
    useState("comment")

  // COMMON
  const [reward, setReward] =
    useState("")

  const [timeLimit, setTimeLimit] =
    useState("30")

  // =========================================
  // TYPE NUMBER
  // =========================================

  const typeNumber =
    useMemo(() => {

      if (
        taskType === "post"
      ) return "1"

      if (
        commentType ===
        "comment"
      ) return "2"

      if (
        commentType ===
        "reply"
      ) return "3"

      if (
        commentType ===
        "hyperlink comment"
      ) return "4"

      if (
        commentType ===
        "crosspost"
      ) return "5"

      return "0"

    }, [
      taskType,
      commentType,
    ])

  // =========================================
  // GENERATED TASK ID
  // =========================================

  const generatedTaskId =
    `${clientCode}-${typeNumber}-${taskNumber}`

  // =========================================
  // CREATE TASK
  // =========================================

  const handleCreateTask =
    async () => {

      setLoading(true)

      // CHECK DUPLICATE
      const {
        data: existing,
      } = await supabase
        .from("tasks")
        .select("id")
        .eq(
          "task_code",
          generatedTaskId
        )
        .maybeSingle()

      if (existing) {

        alert(
          "Task ID already exists"
        )

        setLoading(false)

        return
      }

      const payload = {

        task_code:
          generatedTaskId,

        task_type:
          taskType,

        // POST
        subreddit,
        title,
        flair,
        body,
        image_link:
          imageLink,

        // COMMENT
        post_link:
          postLink,

        comment_type:
          commentType,

        // COMMON
        reward:
          Number(reward),

        time_limit:
          Number(timeLimit),

        status: "open",
      }

      const { error } =
        await supabase
          .from("tasks")
          .insert([payload])

      if (error) {

        alert(error.message)

        setLoading(false)

        return
      }

      alert(
        `Task created: ${generatedTaskId}`
      )

      // RESET
      setSubreddit("")
      setTitle("")
      setFlair("")
      setBody("")
      setImageLink("")
      setPostLink("")
      setCommentType(
        "comment"
      )
      setReward("")
      setTimeLimit("30")

      setTaskNumber(
        (
          Number(taskNumber) + 1
        ).toString()
      )

      setLoading(false)
    }

  return (

    <div className="
      min-h-screen
      bg-[#05070A]
      text-white
      p-6
    ">

      <div className="
        max-w-3xl
        mx-auto
      ">

        <h1 className="
          text-4xl
          font-bold
          mb-2
        ">
          Create Task
        </h1>

        <p className="
          text-zinc-400
          mb-10
        ">
          Publish Reddit posting and commenting tasks
        </p>

        <div className="
          bg-white/5
          border
          border-white/10
          rounded-3xl
          p-8
          space-y-6
        ">

          {/* TASK ID */}
          <div className="
            bg-black/30
            border
            border-white/10
            rounded-2xl
            p-5
            space-y-5
          ">

            <div className="
              flex
              items-center
              justify-between
              flex-wrap
              gap-4
            ">

              <div>

                <p className="
                  text-sm
                  text-zinc-400
                ">
                  Generated Task ID
                </p>

                <h2 className="
                  text-3xl
                  font-bold
                  mt-2
                  tracking-wider
                ">
                  {generatedTaskId}
                </h2>

              </div>

            </div>

            <div className="
              grid
              md:grid-cols-2
              gap-5
            ">

              <div>

                <label className="
                  block
                  mb-2
                  text-sm
                  text-zinc-400
                ">
                  Client Code
                </label>

                <input
                  value={
                    clientCode
                  }
                  onChange={(e) =>
                    setClientCode(
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="A"
                  className="
                    w-full
                    bg-black/30
                    border
                    border-white/10
                    rounded-xl
                    p-4
                    uppercase
                  "
                />

              </div>

              <div>

                <label className="
                  block
                  mb-2
                  text-sm
                  text-zinc-400
                ">
                  Task Number
                </label>

                <input
                  value={
                    taskNumber
                  }
                  onChange={(e) =>
                    setTaskNumber(
                      e.target.value
                    )
                  }
                  placeholder="1001"
                  className="
                    w-full
                    bg-black/30
                    border
                    border-white/10
                    rounded-xl
                    p-4
                  "
                />

              </div>

            </div>

          </div>

          {/* TASK TYPE */}
          <div>

            <label className="
              block
              mb-2
              text-sm
              text-zinc-400
            ">
              Task Type
            </label>

            <select
              value={taskType}
              onChange={(e) =>
                setTaskType(
                  e.target.value
                )
              }
              className="
                w-full
                bg-black/30
                border
                border-white/10
                rounded-xl
                p-4
              "
            >

              <option value="post">
                Post
              </option>

              <option value="comment">
                Comment
              </option>

            </select>

          </div>

          {/* POST TASK */}
          {taskType ===
            "post" && (

            <>

              <Input
                label="Subreddit"
                value={subreddit}
                setValue={
                  setSubreddit
                }
                placeholder="r/AskReddit"
              />

              <Input
                label="Title"
                value={title}
                setValue={
                  setTitle
                }
                placeholder="Post title"
              />

              <Input
                label="Flair"
                value={flair}
                setValue={
                  setFlair
                }
                placeholder="Optional flair"
              />

              <Textarea
                label="Body"
                value={body}
                setValue={
                  setBody
                }
                placeholder="Post body"
              />

              <Input
                label="Image Drive Link"
                value={imageLink}
                setValue={
                  setImageLink
                }
                placeholder="https://drive.google.com/..."
              />

            </>
          )}

          {/* COMMENT TASK */}
          {taskType ===
            "comment" && (

            <>

              <Input
                label="Post Link"
                value={postLink}
                setValue={
                  setPostLink
                }
                placeholder="Reddit post URL"
              />

              <div>

                <label className="
                  block
                  mb-2
                  text-sm
                  text-zinc-400
                ">
                  Comment Type
                </label>

                <select
                  value={
                    commentType
                  }
                  onChange={(e) =>
                    setCommentType(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    bg-black/30
                    border
                    border-white/10
                    rounded-xl
                    p-4
                  "
                >

                  <option value="comment">
                    Comment
                  </option>

                  <option value="reply">
                    Reply
                  </option>

                  <option value="hyperlink comment">
                    Hyperlink Comment
                  </option>

                  <option value="crosspost">
                    Crosspost
                  </option>

                </select>

              </div>

              <Textarea
                label="Body"
                value={body}
                setValue={
                  setBody
                }
                placeholder="Comment body"
              />

            </>
          )}

          {/* COMMON */}
          <Input
            label="Reward ($)"
            value={reward}
            setValue={setReward}
            placeholder="0.50"
            type="number"
          />

          <Input
            label="Time Allotted (minutes)"
            value={timeLimit}
            setValue={
              setTimeLimit
            }
            placeholder="30"
            type="number"
          />

          <button
            onClick={
              handleCreateTask
            }
            disabled={loading}
            className="
              w-full
              bg-red-500
              hover:bg-red-600
              transition-all
              rounded-2xl
              p-4
              font-semibold
              text-lg
            "
          >

            {loading
              ? "Creating Task..."
              : "Publish Task"}

          </button>

        </div>

      </div>

    </div>
  )
}

function Input({
  label,
  value,
  setValue,
  placeholder,
  type = "text",
}: any) {

  return (

    <div>

      <label className="
        block
        mb-2
        text-sm
        text-zinc-400
      ">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          setValue(
            e.target.value
          )
        }
        placeholder={placeholder}
        className="
          w-full
          bg-black/30
          border
          border-white/10
          rounded-xl
          p-4
          outline-none
        "
      />

    </div>
  )
}

function Textarea({
  label,
  value,
  setValue,
  placeholder,
}: any) {

  return (

    <div>

      <label className="
        block
        mb-2
        text-sm
        text-zinc-400
      ">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) =>
          setValue(
            e.target.value
          )
        }
        placeholder={placeholder}
        rows={6}
        className="
          w-full
          bg-black/30
          border
          border-white/10
          rounded-xl
          p-4
          outline-none
          resize-none
        "
      />

    </div>
  )
}