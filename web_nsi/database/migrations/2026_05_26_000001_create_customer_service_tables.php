<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cs_complaints', function (Blueprint $table) {
            $table->id();
            $table->string('customer_id');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('subject');
            $table->text('message');
            $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->timestamps();
        });

        Schema::create('cs_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('complaint_id')->nullable();
            $table->string('customer_id');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->text('message');
            $table->enum('sender', ['admin', 'customer'])->default('admin');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->foreign('complaint_id')->references('id')->on('cs_complaints')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cs_messages');
        Schema::dropIfExists('cs_complaints');
    }
};
