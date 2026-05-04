import { supabase } from '@/lib/supabase'

export default async function SubmissionsPage() {
  const { data, error } = await supabase
    .from('task_claims')
    .select(`
      id,
      user_id,
      task_id,
      status,
      submission_link,
      created_at
    `)
    .in('status', ['submitted', 'approved', 'rejected'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return <div className="p-6">Error loading submissions</div>
  }

  const pending = data?.filter(d => d.status === 'submitted') || []
  const approved = data?.filter(d => d.status === 'approved') || []
  const rejected = data?.filter(d => d.status === 'rejected') || []

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Submissions</h1>

      <Section title="Pending" items={pending} />
      <Section title="Approved" items={approved} />
      <Section title="Rejected" items={rejected} />
    </div>
  )
}

function Section({ title, items }: { title: string; items: any[] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">
        {title} ({items.length})
      </h2>

      {items.length === 0 ? (
        <div className="text-gray-500">No tasks</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 border rounded flex justify-between items-center"
            >
              <div>
                <div className="text-sm">Task ID: {item.task_id}</div>

                <a
                  href={item.submission_link}
                  target="_blank"
                  className="text-blue-500 text-sm"
                >
                  View Submission
                </a>
              </div>

              <div className="text-xs capitalize">
                {item.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}