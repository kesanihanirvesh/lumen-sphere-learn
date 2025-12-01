import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ListViewProps {
  table: string;
  columns?: string[];
}

export default function ListView({ table, columns }: ListViewProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from(table)
        .select(columns?.join(",") || "*");

      if (error) console.error("Error fetching data:", error.message);
      else setData(rows || []);

      setLoading(false);
    };
    fetchData();
  }, [table, columns]);

  const handleEdit = (index: number) => {
    setEditingRow(index);
    setEditValues(data[index]); // includes id fields
  };

  const handleChange = (col: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [col]: value }));
  };

  // 🔥 Remove ALL id / uuid fields before sending update
  const sanitizeUpdate = () => {
    const result: Record<string, any> = {};

    for (const [key, val] of Object.entries(editValues)) {
      const isIdField =
        key.toLowerCase() === "id" || key.toLowerCase().endsWith("id");

      if (!isIdField) {
        result[key] = val; // only normal fields kept
      }
    }

    return result;
  };

  const handleSave = async (id: any) => {
    const cleanValues = sanitizeUpdate(); // UUID safe

    const { error } = await supabase
      .from(table)
      .update(cleanValues)
      .eq("id", id);

    if (error) {
      alert("Error updating: " + error.message);
      return;
    }

    // Update UI instantly
    setData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...cleanValues } : row))
    );

    setEditingRow(null);
  };

  if (loading) return <p className="text-center text-gray-500 mt-4">Loading...</p>;
  if (!data.length) return <p className="text-center text-gray-500 mt-4">No records found.</p>;

  // Auto-detected columns minus UUID/ID fields
  const displayColumns = (columns || Object.keys(data[0])).filter(
    (col) => !col.toLowerCase().endsWith("id") // remove: id, topic_id, user_id, etc.
  );

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 bg-white mt-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {displayColumns.map((col) => (
              <th
                key={col}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                {col.replaceAll("_", " ")}
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-200">
              {displayColumns.map((col) => (
                <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {editingRow === idx ? (
                    <input
                      type="text"
                      value={editValues[col] ?? ""}
                      onChange={(e) => handleChange(col, e.target.value)}
                      className="border rounded px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    row[col]
                  )}
                </td>
              ))}

              <td className="px-6 py-4">
                {editingRow === idx ? (
                  <button
                    onClick={() => handleSave(row.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(idx)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
