import { getSiteData } from "../actions";
import Image from "next/image";
import styles from "./rooms.module.css";
import RoomsContent from "./RoomsContent";

export const revalidate = 3600;

export default async function RoomsPage() {
    const data = await getSiteData();
    const rooms = data.rooms || [];
    const content = data.content || {};
    const roomsKeys = content?.rooms_intro || {};

    return (
        <main className={styles.pageWrapper}>
            {/* HERO SECTION - Server Rendered for Speed */}
            <section className={styles.hero}>
                <Image
                    src={content?.rooms_hero?.image || "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446787/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0698_zmv8bg.jpg"}
                    alt="Rooms Hero"
                    fill
                    priority
                    quality={75}
                    sizes="100vw"
                    className={styles.heroImage}
                    style={{ objectFit: 'cover' }}
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <div>
                        <span className={styles.badge}>{roomsKeys.badge || "Our Collection"}</span>
                        <h1 className={styles.title}>{roomsKeys.title || "Luxury Reimagined"}</h1>
                        <p className={styles.subtitle}>
                            {roomsKeys.desc || "A curated selection of sanctuaries designed for ultimate comfort and cultural elegance."}
                        </p>
                    </div>
                </div>
            </section>

            {/* Interactive Content - Client Side for filtering and booking */}
            <RoomsContent initialRooms={rooms} content={content} />
        </main>
    );
}
