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

  // Fetch all data including primary key
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: rows, error } = await supabase.from(table).select("*");
      if (error) {
        console.error("Error fetching data:", error.message);
        setData([]);
      } else {
        setData(rows || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [table]);

  const handleEdit = (index: number) => {
    setEditingRow(index);
    setEditValues(data[index]);
  };

  const handleChange = (col: string, value: string) => {
    let v: any = value;

    // Convert to number if numeric
    if (!isNaN(Number(value)) && value.trim() !== "") v = Number(value);
    // Convert to boolean
    if (value === "true" || value === "false") v = value === "true";
    // Empty → null
    if (value.trim() === "") v = null;

    setEditValues((prev) => ({ ...prev, [col]: v }));
  };

  // Prepare safe update values excluding id and undefined
  const sanitizeUpdate = () => {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(editValues)) {
      if (key === "id") continue;
      if (val === undefined) continue;
      result[key] = val;
    }
    return result;
  };

  const handleSave = async (id: string) => {
    const cleanValues = sanitizeUpdate();
    const { error } = await supabase.from(table).update(cleanValues).eq("id", id);
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

  if (loading)
    return <p className="text-center text-gray-500 mt-4">Loading...</p>;
  if (!data.length)
    return <p className="text-center text-gray-500 mt-4">No records found.</p>;

  // Auto-detect columns excluding primary key
  const displayColumns = Object.keys(data[0]).filter((col) => col !== "id");

  return (
    <div className="w-full overflow-x-auto mt-6">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-blue-300 shadow-xl rounded-xl">
          <table className="min-w-full divide-y divide-blue-300">
            <thead className="bg-blue-600 sticky top-0 z-10 shadow-sm">
              <tr>
                {displayColumns.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-sm font-semibold text-white tracking-wider uppercase"
                  >
                    {col.replaceAll("_", " ")}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-blue-200">
              {data.map((row, idx) => (
                <tr
                  key={row.id}
                  className="hover:bg-blue-50 transition duration-150 even:bg-blue-50/40"
                >
                  {displayColumns.map((col) => (
                    <td key={col} className="px-6 py-4 text-sm text-gray-900">
                      {editingRow === idx ? (
                        <input
                          type="text"
                          value={editValues[col] ?? ""}
                          onChange={(e) => handleChange(col, e.target.value)}
                          className="w-full px-3 py-1.5 border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md text-sm"
                        />
                      ) : (
                        <span className="block truncate max-w-[180px]">
                          {String(row[col] ?? "")}
                        </span>
                      )}
                    </td>
                  ))}

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editingRow === idx ? (
                      <button
                        onClick={() => handleSave(row.id)}
                        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-1.5 rounded-lg shadow-sm transition"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(idx)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg shadow-sm transition"
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
      </div>
    </div>
  );
}
