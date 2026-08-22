CREATE TABLE "in_progress_evidence" (
    "id"             UUID NOT NULL,
    "traffic_job_id" UUID NOT NULL,
    "image_urls"     TEXT[],
    "gps_latitude"   DECIMAL(10,7),
    "gps_longitude"  DECIMAL(10,7),
    "gps_map_link"   TEXT,
    "submitted_by"   TEXT NOT NULL,
    "submitted_by_id" TEXT NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "in_progress_evidence_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "in_progress_evidence"
    ADD CONSTRAINT "in_progress_evidence_traffic_job_id_fkey"
    FOREIGN KEY ("traffic_job_id") REFERENCES "traffic_jobs"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "in_progress_evidence_traffic_job_id_submitted_by_key"
    ON "in_progress_evidence"("traffic_job_id", "submitted_by");
