
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "ai_conversations": {
                  Row: {
                    "created_at": string,"id": string,"locale": string,"updated_at": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"locale"?: string,"updated_at"?: string,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"locale"?: string,"updated_at"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"ai_messages": {
                  Row: {
                    "content": string,"conversation_id": string,"created_at": string,"id": string,"role": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content": string,"conversation_id": string,"created_at"?: string,"id"?: string,"role": string,"updated_at"?: string
                  }
                  Update: {
                    "content"?: string,"conversation_id"?: string,"created_at"?: string,"id"?: string,"role"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "ai_messages_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "ai_conversations"
      referencedColumns: ["id"]
    }
                  ]
                },"announcements": {
                  Row: {
                    "created_at": string,"id": string,"locale": string,"message": string,"published": boolean,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"locale": string,"message": string,"published"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"locale"?: string,"message"?: string,"published"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"answer_options": {
                  Row: {
                    "created_at": string,"id": string,"is_correct": boolean,"question_id": string,"text": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_correct"?: boolean,"question_id": string,"text": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_correct"?: boolean,"question_id"?: string,"text"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "answer_options_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"after": Json | null,"before": Json | null,"created_at": string,"entity": string,"entity_id": string | null,"id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"after"?: Json | null,"before"?: Json | null,"created_at"?: string,"entity": string,"entity_id"?: string | null,"id"?: string,"updated_at"?: string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"after"?: Json | null,"before"?: Json | null,"created_at"?: string,"entity"?: string,"entity_id"?: string | null,"id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"certificates": {
                  Row: {
                    "cert_no": string,"created_at": string,"enrollment_id": string,"id": string,"issued_at": string,"pdf_path": string | null,"revoked_at": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cert_no": string,"created_at"?: string,"enrollment_id": string,"id"?: string,"issued_at"?: string,"pdf_path"?: string | null,"revoked_at"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "cert_no"?: string,"created_at"?: string,"enrollment_id"?: string,"id"?: string,"issued_at"?: string,"pdf_path"?: string | null,"revoked_at"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "certificates_enrollment_id_fkey"
      columns: ["enrollment_id"]
isOneToOne: true
      referencedRelation: "enrollments"
      referencedColumns: ["id"]
    }
                  ]
                },"changelog": {
                  Row: {
                    "body": string,"created_at": string,"id": string,"locale": string,"published": boolean,"published_at": string | null,"slug": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string,"created_at"?: string,"id"?: string,"locale": string,"published"?: boolean,"published_at"?: string | null,"slug": string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"id"?: string,"locale"?: string,"published"?: boolean,"published_at"?: string | null,"slug"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"classroom_waitlist": {
                  Row: {
                    "county_id": string,"created_at": string,"email": string,"id": string,"locale": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "county_id": string,"created_at"?: string,"email": string,"id"?: string,"locale": string,"updated_at"?: string
                  }
                  Update: {
                    "county_id"?: string,"created_at"?: string,"email"?: string,"id"?: string,"locale"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "classroom_waitlist_county_id_fkey"
      columns: ["county_id"]
isOneToOne: false
      referencedRelation: "counties"
      referencedColumns: ["id"]
    }
                  ]
                },"completion_reports": {
                  Row: {
                    "batch_id": string | null,"certificate_id": string,"created_at": string,"error": string | null,"id": string,"regulator_ref": string | null,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "batch_id"?: string | null,"certificate_id": string,"created_at"?: string,"error"?: string | null,"id"?: string,"regulator_ref"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "batch_id"?: string | null,"certificate_id"?: string,"created_at"?: string,"error"?: string | null,"id"?: string,"regulator_ref"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "completion_reports_certificate_id_fkey"
      columns: ["certificate_id"]
isOneToOne: false
      referencedRelation: "certificates"
      referencedColumns: ["id"]
    }
                  ]
                },"counties": {
                  Row: {
                    "case_lookup_url": string | null,"created_at": string,"id": string,"instructions": NonNullable<Json>,"name": string,"popular_rank": number | null,"seat_city": string,"slug": string,"state_code": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "case_lookup_url"?: string | null,"created_at"?: string,"id"?: string,"instructions"?: NonNullable<Json>,"name": string,"popular_rank"?: number | null,"seat_city": string,"slug": string,"state_code": string,"updated_at"?: string
                  }
                  Update: {
                    "case_lookup_url"?: string | null,"created_at"?: string,"id"?: string,"instructions"?: NonNullable<Json>,"name"?: string,"popular_rank"?: number | null,"seat_city"?: string,"slug"?: string,"state_code"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "counties_state_code_fkey"
      columns: ["state_code"]
isOneToOne: false
      referencedRelation: "states"
      referencedColumns: ["code"]
    }
                  ]
                },"courses": {
                  Row: {
                    "active": boolean,"created_at": string,"id": string,"list_price_cents": number | null,"price_cents": number,"slug": string,"state_code": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"created_at"?: string,"id"?: string,"list_price_cents"?: number | null,"price_cents": number,"slug": string,"state_code": string,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"created_at"?: string,"id"?: string,"list_price_cents"?: number | null,"price_cents"?: number,"slug"?: string,"state_code"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "courses_state_code_fkey"
      columns: ["state_code"]
isOneToOne: false
      referencedRelation: "states"
      referencedColumns: ["code"]
    }
                  ]
                },"courts": {
                  Row: {
                    "address": string | null,"case_lookup_url": string | null,"citation_regex": string | null,"city": string | null,"county_id": string,"court_code": string | null,"created_at": string,"id": string,"instructions": NonNullable<Json>,"name": string,"slug": string,"state_code": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"case_lookup_url"?: string | null,"citation_regex"?: string | null,"city"?: string | null,"county_id": string,"court_code"?: string | null,"created_at"?: string,"id"?: string,"instructions"?: NonNullable<Json>,"name": string,"slug": string,"state_code": string,"updated_at"?: string
                  }
                  Update: {
                    "address"?: string | null,"case_lookup_url"?: string | null,"citation_regex"?: string | null,"city"?: string | null,"county_id"?: string,"court_code"?: string | null,"created_at"?: string,"id"?: string,"instructions"?: NonNullable<Json>,"name"?: string,"slug"?: string,"state_code"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "courts_county_id_fkey"
      columns: ["county_id"]
isOneToOne: false
      referencedRelation: "counties"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "courts_state_code_fkey"
      columns: ["state_code"]
isOneToOne: false
      referencedRelation: "states"
      referencedColumns: ["code"]
    }
                  ]
                },"enrollments": {
                  Row: {
                    "citation_no": string | null,"completed_at": string | null,"course_id": string,"course_locale": string,"court_due_date": string | null,"court_id": string | null,"created_at": string,"expires_at": string | null,"id": string,"order_id": string | null,"started_at": string | null,"status": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "citation_no"?: string | null,"completed_at"?: string | null,"course_id": string,"course_locale": string,"court_due_date"?: string | null,"court_id"?: string | null,"created_at"?: string,"expires_at"?: string | null,"id"?: string,"order_id"?: string | null,"started_at"?: string | null,"status"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "citation_no"?: string | null,"completed_at"?: string | null,"course_id"?: string,"course_locale"?: string,"court_due_date"?: string | null,"court_id"?: string | null,"created_at"?: string,"expires_at"?: string | null,"id"?: string,"order_id"?: string | null,"started_at"?: string | null,"status"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "enrollments_course_id_fkey"
      columns: ["course_id"]
isOneToOne: false
      referencedRelation: "courses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "enrollments_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"exam_attempts": {
                  Row: {
                    "answers": NonNullable<Json>,"created_at": string,"enrollment_id": string,"id": string,"passed": boolean | null,"question_ids": (string)[],"score": number | null,"started_at": string,"submitted_at": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answers"?: NonNullable<Json>,"created_at"?: string,"enrollment_id": string,"id"?: string,"passed"?: boolean | null,"question_ids"?: (string)[],"score"?: number | null,"started_at"?: string,"submitted_at"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "answers"?: NonNullable<Json>,"created_at"?: string,"enrollment_id"?: string,"id"?: string,"passed"?: boolean | null,"question_ids"?: (string)[],"score"?: number | null,"started_at"?: string,"submitted_at"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "exam_attempts_enrollment_id_fkey"
      columns: ["enrollment_id"]
isOneToOne: false
      referencedRelation: "enrollments"
      referencedColumns: ["id"]
    }
                  ]
                },"faq_items": {
                  Row: {
                    "body": string,"created_at": string,"id": string,"locale": string,"position": number,"published": boolean,"slug": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string,"created_at"?: string,"id"?: string,"locale": string,"position"?: number,"published"?: boolean,"slug": string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"id"?: string,"locale"?: string,"position"?: number,"published"?: boolean,"slug"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"identity_checks": {
                  Row: {
                    "asked_at": string,"correct": boolean,"created_at": string,"enrollment_id": string,"id": string,"question_key": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "asked_at"?: string,"correct": boolean,"created_at"?: string,"enrollment_id": string,"id"?: string,"question_key": string,"updated_at"?: string
                  }
                  Update: {
                    "asked_at"?: string,"correct"?: boolean,"created_at"?: string,"enrollment_id"?: string,"id"?: string,"question_key"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "identity_checks_enrollment_id_fkey"
      columns: ["enrollment_id"]
isOneToOne: false
      referencedRelation: "enrollments"
      referencedColumns: ["id"]
    }
                  ]
                },"kb_chunks": {
                  Row: {
                    "content": string,"created_at": string,"embedding": string | null,"id": string,"locale": string,"source": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content": string,"created_at"?: string,"embedding"?: string | null,"id"?: string,"locale": string,"source": string,"updated_at"?: string
                  }
                  Update: {
                    "content"?: string,"created_at"?: string,"embedding"?: string | null,"id"?: string,"locale"?: string,"source"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"lesson_blocks": {
                  Row: {
                    "content": NonNullable<Json>,"created_at": string,"id": string,"lesson_id": string,"position": number,"type": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"lesson_id": string,"position": number,"type": string,"updated_at"?: string
                  }
                  Update: {
                    "content"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"lesson_id"?: string,"position"?: number,"type"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lesson_blocks_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    }
                  ]
                },"lesson_progress": {
                  Row: {
                    "completed_at": string | null,"created_at": string,"enrollment_id": string,"id": string,"lesson_id": string,"seconds_spent": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string | null,"created_at"?: string,"enrollment_id": string,"id"?: string,"lesson_id": string,"seconds_spent"?: number,"updated_at"?: string
                  }
                  Update: {
                    "completed_at"?: string | null,"created_at"?: string,"enrollment_id"?: string,"id"?: string,"lesson_id"?: string,"seconds_spent"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lesson_progress_enrollment_id_fkey"
      columns: ["enrollment_id"]
isOneToOne: false
      referencedRelation: "enrollments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "lesson_progress_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    }
                  ]
                },"lessons": {
                  Row: {
                    "created_at": string,"id": string,"min_seconds": number,"position": number,"section_id": string,"title": NonNullable<Json>,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"min_seconds"?: number,"position": number,"section_id": string,"title"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"min_seconds"?: number,"position"?: number,"section_id"?: string,"title"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lessons_section_id_fkey"
      columns: ["section_id"]
isOneToOne: false
      referencedRelation: "sections"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "amount_cents": number,"created_at": string,"currency": string,"id": string,"product": string,"status": string,"stripe_payment_intent": string | null,"stripe_session_id": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"created_at"?: string,"currency"?: string,"id"?: string,"product": string,"status"?: string,"stripe_payment_intent"?: string | null,"stripe_session_id"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "amount_cents"?: number,"created_at"?: string,"currency"?: string,"id"?: string,"product"?: string,"status"?: string,"stripe_payment_intent"?: string | null,"stripe_session_id"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"pages": {
                  Row: {
                    "body": string,"created_at": string,"id": string,"locale": string,"published": boolean,"slug": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string,"created_at"?: string,"id"?: string,"locale": string,"published"?: boolean,"slug": string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"id"?: string,"locale"?: string,"published"?: boolean,"slug"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"posts": {
                  Row: {
                    "body": string,"created_at": string,"excerpt": string,"id": string,"locale": string,"published": boolean,"published_at": string | null,"slug": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string,"created_at"?: string,"excerpt"?: string,"id"?: string,"locale": string,"published"?: boolean,"published_at"?: string | null,"slug": string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"excerpt"?: string,"id"?: string,"locale"?: string,"published"?: boolean,"published_at"?: string | null,"slug"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"details_locked_at": string | null,"dob": string | null,"email_verified_at": string | null,"first_name": string,"id": string,"last_name": string,"legal_name": string | null,"license_no": string | null,"license_state": string | null,"phone": string | null,"preferred_locale": string,"role": Database["public"]['Enums']["app_role"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"details_locked_at"?: string | null,"dob"?: string | null,"email_verified_at"?: string | null,"first_name"?: string,"id"?: string,"last_name"?: string,"legal_name"?: string | null,"license_no"?: string | null,"license_state"?: string | null,"phone"?: string | null,"preferred_locale"?: string,"role"?: Database["public"]['Enums']["app_role"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"details_locked_at"?: string | null,"dob"?: string | null,"email_verified_at"?: string | null,"first_name"?: string,"id"?: string,"last_name"?: string,"legal_name"?: string | null,"license_no"?: string | null,"license_state"?: string | null,"phone"?: string | null,"preferred_locale"?: string,"role"?: Database["public"]['Enums']["app_role"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"questions": {
                  Row: {
                    "created_at": string,"explanation": string,"id": string,"locale": string,"section_id": string | null,"text": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"explanation"?: string,"id"?: string,"locale": string,"section_id"?: string | null,"text": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"explanation"?: string,"id"?: string,"locale"?: string,"section_id"?: string | null,"text"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "questions_section_id_fkey"
      columns: ["section_id"]
isOneToOne: false
      referencedRelation: "sections"
      referencedColumns: ["id"]
    }
                  ]
                },"quiz_attempts": {
                  Row: {
                    "answers": NonNullable<Json>,"created_at": string,"enrollment_id": string,"id": string,"passed": boolean | null,"question_ids": (string)[],"score": number | null,"section_id": string,"started_at": string,"submitted_at": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answers"?: NonNullable<Json>,"created_at"?: string,"enrollment_id": string,"id"?: string,"passed"?: boolean | null,"question_ids"?: (string)[],"score"?: number | null,"section_id": string,"started_at"?: string,"submitted_at"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "answers"?: NonNullable<Json>,"created_at"?: string,"enrollment_id"?: string,"id"?: string,"passed"?: boolean | null,"question_ids"?: (string)[],"score"?: number | null,"section_id"?: string,"started_at"?: string,"submitted_at"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "quiz_attempts_enrollment_id_fkey"
      columns: ["enrollment_id"]
isOneToOne: false
      referencedRelation: "enrollments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quiz_attempts_section_id_fkey"
      columns: ["section_id"]
isOneToOne: false
      referencedRelation: "sections"
      referencedColumns: ["id"]
    }
                  ]
                },"rate_limits": {
                  Row: {
                    "hits": number,"key": string,"window_start": string
                  }
                  ComputedFields: never
                  Insert: {
                    "hits"?: number,"key": string,"window_start": string
                  }
                  Update: {
                    "hits"?: number,"key"?: string,"window_start"?: string
                  }
                  Relationships: [
                    
                  ]
                },"refunds": {
                  Row: {
                    "amount_cents": number,"approved_by": string | null,"created_at": string,"id": string,"order_id": string,"pct": number,"reason": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"approved_by"?: string | null,"created_at"?: string,"id"?: string,"order_id": string,"pct": number,"reason"?: string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "amount_cents"?: number,"approved_by"?: string | null,"created_at"?: string,"id"?: string,"order_id"?: string,"pct"?: number,"reason"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "refunds_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"report_attempts": {
                  Row: {
                    "at": string,"created_at": string,"id": string,"report_id": string,"request": NonNullable<Json>,"response": Json | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "at"?: string,"created_at"?: string,"id"?: string,"report_id": string,"request"?: NonNullable<Json>,"response"?: Json | null,"updated_at"?: string
                  }
                  Update: {
                    "at"?: string,"created_at"?: string,"id"?: string,"report_id"?: string,"request"?: NonNullable<Json>,"response"?: Json | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "report_attempts_report_id_fkey"
      columns: ["report_id"]
isOneToOne: false
      referencedRelation: "completion_reports"
      referencedColumns: ["id"]
    }
                  ]
                },"reviews": {
                  Row: {
                    "author_name": string,"body": string,"created_at": string,"id": string,"locale": string,"published": boolean,"rating": number,"slug": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_name"?: string,"body"?: string,"created_at"?: string,"id"?: string,"locale": string,"published"?: boolean,"rating"?: number,"slug": string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "author_name"?: string,"body"?: string,"created_at"?: string,"id"?: string,"locale"?: string,"published"?: boolean,"rating"?: number,"slug"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"sections": {
                  Row: {
                    "course_id": string,"created_at": string,"id": string,"position": number,"title": NonNullable<Json>,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "course_id": string,"created_at"?: string,"id"?: string,"position": number,"title"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "course_id"?: string,"created_at"?: string,"id"?: string,"position"?: number,"title"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sections_course_id_fkey"
      columns: ["course_id"]
isOneToOne: false
      referencedRelation: "courses"
      referencedColumns: ["id"]
    }
                  ]
                },"security_questions": {
                  Row: {
                    "answer_hash": string,"created_at": string,"id": string,"question": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answer_hash": string,"created_at"?: string,"id"?: string,"question": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "answer_hash"?: string,"created_at"?: string,"id"?: string,"question"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"state_waitlist": {
                  Row: {
                    "created_at": string,"email": string,"id": string,"state_code": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"id"?: string,"state_code": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"id"?: string,"state_code"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "state_waitlist_state_code_fkey"
      columns: ["state_code"]
isOneToOne: false
      referencedRelation: "states"
      referencedColumns: ["code"]
    }
                  ]
                },"states": {
                  Row: {
                    "access_days": number,"active": boolean,"adapter": string | null,"code": string,"created_at": string,"exam_questions": number,"id": string,"max_attempts": number,"min_course_minutes": number,"name": string,"pass_pct": number,"report_times": (string)[],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "access_days"?: number,"active"?: boolean,"adapter"?: string | null,"code": string,"created_at"?: string,"exam_questions"?: number,"id"?: string,"max_attempts"?: number,"min_course_minutes"?: number,"name": string,"pass_pct"?: number,"report_times"?: (string)[],"updated_at"?: string
                  }
                  Update: {
                    "access_days"?: number,"active"?: boolean,"adapter"?: string | null,"code"?: string,"created_at"?: string,"exam_questions"?: number,"id"?: string,"max_attempts"?: number,"min_course_minutes"?: number,"name"?: string,"pass_pct"?: number,"report_times"?: (string)[],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"stripe_events": {
                  Row: {
                    "created_at": string,"event_id": string,"id": string,"processed_at": string | null,"type": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"event_id": string,"id"?: string,"processed_at"?: string | null,"type": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"event_id"?: string,"id"?: string,"processed_at"?: string | null,"type"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"tickets": {
                  Row: {
                    "attachment_path": string | null,"body": string,"created_at": string,"details": NonNullable<Json>,"email": string,"id": string,"page_url": string | null,"status": string,"type": string,"updated_at": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "attachment_path"?: string | null,"body": string,"created_at"?: string,"details"?: NonNullable<Json>,"email": string,"id"?: string,"page_url"?: string | null,"status"?: string,"type": string,"updated_at"?: string,"user_id"?: string | null
                  }
                  Update: {
                    "attachment_path"?: string | null,"body"?: string,"created_at"?: string,"details"?: NonNullable<Json>,"email"?: string,"id"?: string,"page_url"?: string | null,"status"?: string,"type"?: string,"updated_at"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "hit_rate_limit":
{ Args: { "key": string,"max": number,"window_seconds": number }; Returns: boolean
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"make_admin":
{ Args: { "target_email": string }; Returns: string
                           }
          }
          Enums: {
            "app_role": "student"|"admin"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "app_role": ["student", "admin"]
          }
        }
} as const
