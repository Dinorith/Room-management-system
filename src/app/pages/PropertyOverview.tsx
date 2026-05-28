import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Trash2,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { api } from "../lib/api";

export function PropertyOverview() {
  const [properties, setProperties] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch owners list for the filter dropdown
  const fetchFilterData = async () => {
    try {
      const response = await api.getOwners({ per_page: "100" });
      setOwners(response.data.data || []);
    } catch (error) {
      console.error("Failed to load owners filter list:", error);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        search: search,
      };
      if (ownerFilter) params.owner_id = ownerFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.getSuperAdminProperties(params);
      setProperties(response.data.data || []);
      setMeta(response.data.meta);
    } catch (error) {
      console.error("Failed to fetch global properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [page, ownerFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProperties();
  };

  const handleDeleteProperty = async (id: string, status: string) => {
    if (status === "occupied") {
      alert("⚠️ Cannot delete an occupied room! Please terminate or sign out the tenant contract first.");
      return;
    }

    if (!confirm("Are you sure you want to permanently delete this property/room? This will remove all associated payment histories, contracts, and utilities records.")) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.deleteSuperAdminProperty(id);
      fetchProperties();
    } catch (error: any) {
      alert(error.message || "Failed to delete property");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Platform Properties</h1>
          <p className="text-muted-foreground mt-1">Cross-owner audit list of all rental rooms, flats, and suites</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-foreground/10 bg-card p-6 shadow-brutal grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <form onSubmit={handleSearchSubmit} className="md:col-span-1 relative flex items-center">
          <div className="w-full relative">
            <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Search</label>
            <input
              type="text"
              placeholder="Room No. or Type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-foreground/15 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground transition-all"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-[38px] pointer-events-none" />
          </div>
          <button type="submit" className="hidden" />
        </form>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Filter By Owner</label>
          <select
            value={ownerFilter}
            onChange={(e) => {
              setOwnerFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 rounded-2xl border border-foreground/15 bg-background text-foreground focus:outline-none focus:border-foreground transition-all font-medium"
          >
            <option value="">All Owners / Landlords</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Filter By Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 rounded-2xl border border-foreground/15 bg-background text-foreground focus:outline-none focus:border-foreground transition-all font-medium"
          >
            <option value="">All Room Statuses</option>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-full py-2.5" icon={RefreshCw} onClick={fetchProperties} disabled={loading}>
            Reload
          </Button>
        </div>
      </div>

      {/* Grid List */}
      <div className="rounded-3xl border border-foreground/10 bg-card shadow-brutal overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-foreground/10">
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Room Number</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Owner / Landlord</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Room Type</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Capacity</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Monthly Rent</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Current Occupant</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 justify-center">
                      <div className="h-8 w-8 rounded-lg bg-primary animate-pulse" />
                      <p className="text-sm text-muted-foreground font-medium">Loading property list...</p>
                    </div>
                  </td>
                </tr>
              ) : properties.length > 0 ? (
                properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-sm font-bold text-foreground">Room {prop.roomNumber}</td>
                    <td className="p-4 text-sm font-semibold text-foreground">{prop.owner}</td>
                    <td className="p-4 text-sm text-muted-foreground capitalize">{prop.type}</td>
                    <td className="p-4 text-sm text-muted-foreground">{prop.capacity} Persons</td>
                    <td className="p-4 text-sm font-bold text-foreground">${prop.rent}</td>
                    <td className="p-4 text-sm">
                      {prop.tenant ? (
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {prop.tenant}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <Badge variant={
                        prop.status === "occupied" ? "success" :
                        prop.status === "vacant" ? "default" : "warning"
                      }>
                        {prop.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-right">
                      <Button
                        variant="ghost"
                        className={`p-2 min-w-0 ${prop.status === "occupied" ? "opacity-30 cursor-not-allowed" : ""}`}
                        disabled={deleteLoading === prop.id}
                        onClick={() => handleDeleteProperty(prop.id, prop.status)}
                        title={prop.status === "occupied" ? "Cannot delete occupied property" : "Delete property"}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                    No properties/rooms found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.lastPage > 1 && (
          <div className="p-4 border-t border-foreground/10 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing page {meta.currentPage} of {meta.lastPage} ({meta.total} properties)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="py-1 px-3"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <Button
                variant="outline"
                className="py-1 px-3"
                disabled={page >= meta.lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
