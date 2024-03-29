import mongoose from "mongoose";

const customersUri =
	"mongodb+srv://customers:c2CyQh1vB8XyNqC5@cluster0.yh1mk1u.mongodb.net/customers";
const customersConnection = mongoose.createConnection(customersUri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

customersConnection.on("connected", () => {
	console.log("Customers Database Connected");
});

customersConnection.on("error", (error) => {
	console.error("Error connecting to Customers Database:", error);
});

const userDetailsSchema = new mongoose.Schema({
	user: [
		{
			user_id: { type: Number, unique: true },
			username: { type: String },
			email: { type: String, unique: true },
			balance: { type: Number },
			apiKey: { type: String },
			apiSecretKey: { type: String },
		},
	],
	transactions: [
		{
			model_id: { type: Number },
			transaction_date: { type: Date },
			amount: { type: Number },
			transaction_type: { type: String, enum: ["buy", "sell"] },
		},
	],
	portfolios: [
		{
			model_id: { type: Number },
			quantity: { type: Number },
			average_price: { type: Number },
			current_value: { type: Number },
		},
	],
});

const UserDetails = customersConnection.model(
	"UserDetails",
	userDetailsSchema
);

const getNextUserId = async () => {
	try {
		const result = await UserDetails.find()
			.sort({ "user.user_id": -1 })
			.limit(1);

		if (
			result &&
			result.length > 0 &&
			result[0].user &&
			result[0].user.length > 0
		) {
			const lastUserId = result[0].user[0].user_id;
			return lastUserId + 1;
		} else {
			return 1;
		}
	} catch (error) {
		console.error("Error generating user_id:", error);
		throw error;
	}
};

const generateUserIdAndSaveUser = async (userData) => {
	const user_id = await getNextUserId();
	const newUser = {
		user_id,
		balance: 0,
		...userData,
	};

	if (!newUser.username) {
		newUser.username = `user${user_id}`;
	}

	try {
		const createdUser = await UserDetails.create({ user: newUser });
		console.log("User created:", createdUser);
	} catch (error) {
		console.error("Error creating user:", error);
	}
};

export { UserDetails, getNextUserId, generateUserIdAndSaveUser };
