async function migrateEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    const eventsToUpdate = await Event.find({
      date: { $exists: true },
      startDate: { $exists: false },
    }).lean();

    console.log(`Found ${eventsToUpdate.length} events to update`);

    for (const event of eventsToUpdate) {
      const startDate = new Date(event.date);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      await Event.updateOne(
        { _id: event._id },
        {
          $set: {
            startDate,
            endDate,
          },
          $unset: {
            date: "",
          },
        }
      );

      console.log(`Updated event ${event._id} with startDate and endDate`);
    }

    console.log("Migration complete");

    mongoose.disconnect();
  } catch (err) {
    console.error("Migration failed:", err);
    mongoose.disconnect();
  }
}

migrateEvents();
