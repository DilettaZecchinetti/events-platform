async function migrateEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const eventsToUpdate = await Event.find({
      date: { $exists: true },
      startDate: { $exists: false },
    }).lean();

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
    }

    mongoose.disconnect();
  } catch (err) {
    console.error("Migration failed:", err);
    mongoose.disconnect();
  }
}

migrateEvents();
