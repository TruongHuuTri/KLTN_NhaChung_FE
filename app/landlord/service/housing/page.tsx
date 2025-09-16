"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BuildingsContent from "@/components/landlord/BuildingsContent";
import { getBuildings, deleteBuilding } from "@/services/buildings";
import type { Building } from "@/types/Building";

export default function ServiceHousingPage() {
  const router = useRouter();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getBuildings(page, limit, searchQuery);
      if (Array.isArray(res)) {
        setBuildings(res);
        setTotal(res.length);
      } else {
        setBuildings(res.buildings || []);
        setTotal(res.total ?? (res.buildings ? res.buildings.length : 0));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  const handleCreate = () => router.push("/landlord/buildings/create");
  const handleEdit = (id: number) => router.push(`/landlord/buildings/${id}/edit`);
  const handleView = (id: number) => router.push(`/landlord/buildings/${id}`);
  const handleDelete = async (id: number) => {
    await deleteBuilding(id);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Quản lý căn hộ</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
        >
          Tạo dãy mới
        </button>
      </div>
      <BuildingsContent
        buildings={buildings}
        currentPage={page}
        totalPages={totalPages}
        searchQuery={searchQuery}
        onSearch={(q) => {
          setPage(1);
          setSearchQuery(q);
        }}
        onPageChange={(p) => setPage(p)}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onRefresh={fetchData}
      />
    </div>
  );
}


