import { db } from "@/firebase/firebaseconfig"; // Ensure this uses firebase/app and firebase/firestore
import { collection, query, where, getDocs } from "firebase/firestore";
import { listConfigurations } from "./list-details/list-configrations";
import { BadgeConsort } from "@/ui/components/BadgeConsort";
import { Button3 } from "@/ui/components/Button3";
import { FeatherList, FeatherPlus } from "@subframe/core";
import { useRouter } from "next/navigation";

export async function getAdminCollectionCounts() {
    const results: Record<string, any> = {};

    for (const [key, config] of Object.entries(listConfigurations)) {
        const tabCounts: Record<string, number> = {};
        const seenCollections = new Set<string>();
        let totalCount = 0;

        for (const tab of config.tabs) {
            let count = 0;

            if (tab.filterField && tab.filterValue) {
                const q = query(
                    collection(db, tab.collection),
                    where(tab.filterField, "==", tab.filterValue)
                );
                const snapshot = await getDocs(q);
                count = snapshot.size;
            } else {
                const snapshot = await getDocs(collection(db, tab.collection));
                count = snapshot.size;
            }

            tabCounts[tab.label] = count;

            // To avoid counting the same collection multiple times
            if (!seenCollections.has(tab.collection)) {
                const totalSnapshot = await getDocs(collection(db, tab.collection));
                totalCount += totalSnapshot.size;
                seenCollections.add(tab.collection);
            }
        }

        results[key] = {
            heading: config.heading,
            totalCount,
            tabCounts,
        };
    }

    return results;
}


export function AdminCard({ heading, tabCounts, sectionKey }: {
    heading: string;
    tabCounts: Record<string, number>;
    sectionKey: string;
}) {
    const router = useRouter();

    return (
        <div className="admin-card flex min-h-[280px] grow shrink-0 basis-0 flex-col items-start gap-6 self-stretch !rounded-2xl bg-default-background px-8 py-8 shadow-md">
            <div className="flex w-full grow shrink-0 basis-0 items-start gap-4">
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-3 px-1 py-1">
                    <span className="font-['Manrope'] text-[30px] font-[600] leading-[40px] text-default-font pl-2.5">
                        {heading}
                    </span>
                    <div className="flex flex-col items-start gap-1">
                        {Object.entries(tabCounts).map(([label, count]) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <span className="text-body font-body text-subtext-color">
                                    - {label}
                                </span>
                                <BadgeConsort variant="neutral" variant2="small">{count}</BadgeConsort>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 pl-2.5">
                <Button3
                    className="rounded-3xl"
                    variant="black"
                    size="small"
                    iconRight={<FeatherPlus />}
                    onClick={() => router.push(`/admin/${sectionKey}`)}
                >
                    Add New
                </Button3>
                <Button3
                    className="rounded-3xl"
                    variant="neutral-tertiary"
                    size="small"
                    iconRight={<FeatherList />}
                    onClick={() => router.push(`/admin/list-details?type=${sectionKey}`)}
                >
                    Published
                </Button3>
            </div>
        </div>
    );
}
