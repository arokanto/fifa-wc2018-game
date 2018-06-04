CREATE TABLE "guess_match" (
	"id" serial NOT NULL,
	"match_id" int NOT NULL,
	"user_id" int NOT NULL,
	"guess_home" smallint NOT NULL,
	"guess_away" smallint NOT NULL,
	CONSTRAINT guess_match_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "player" (
	"id" serial NOT NULL,
	"email_address" varchar NOT NULL UNIQUE,
	"pass_hash" varchar NOT NULL,
	"display_name" varchar NOT NULL UNIQUE,
	"reset_password" BOOLEAN NOT NULL,
	CONSTRAINT player_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "guess_position" (
	"id" serial NOT NULL,
	"round" int NOT NULL,
	"team" int NOT NULL,
	"user_id" int NOT NULL,
	"position" int NOT NULL,
	CONSTRAINT guess_position_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "guess_scorer" (
	"id" serial NOT NULL,
	"user_id" int NOT NULL,
	"player" character varying(100) NOT NULL,
	CONSTRAINT guess_scorer_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "cache" (
	"data" json NOT NULL,
	"time" TIMESTAMP NOT NULL
) WITH (
  OIDS=FALSE
);



CREATE TABLE "session" (
	"sid" character varying NOT NULL,
	"sess" json NOT NULL,
	"expire" TIMESTAMP NOT NULL,
	CONSTRAINT session_pk PRIMARY KEY ("sid")
) WITH (
  OIDS=FALSE
);



ALTER TABLE "guess_match" ADD CONSTRAINT "guess_match_fk0" FOREIGN KEY ("user_id") REFERENCES "player"("id");


ALTER TABLE "guess_position" ADD CONSTRAINT "guess_position_fk0" FOREIGN KEY ("user_id") REFERENCES "player"("id");

ALTER TABLE "guess_scorer" ADD CONSTRAINT "guess_scorer_fk0" FOREIGN KEY ("user_id") REFERENCES "player"("id");



