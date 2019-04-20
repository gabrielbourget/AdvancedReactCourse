const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const Mutations = {
	async createItem(parent, args, ctx, info) {
		// -> TODO: Check if logged in.
		const item = await ctx.db.mutation.createItem({
			data: { ...args }
		}, info);

		return item;
	},
	updateItem(parent, args, ctx, info) {
		// - Take a copy of the updates
		const updates = { ...args };
		// - Remove the ID from the updates
		delete updates.id;
		// - Run the update method
		return ctx.db.mutation.updateItem({
			data: updates,
			where: {
				id: args.id
			}
		}, info);
	},
	async deleteItem(parent, args, ctx, info) {
		const where = { id: args.id };
		// - Find Item 
		const item = await ctx.db.query.item({ where }, `{ id title }`);

		// - Check user permissions 
		// -> TODO 
		// - Delete Item
		return ctx.db.mutation.deleteItem({ where }, info);
	},
	async signup(parent, args, ctx, info) {
		// - Lower case email address 
		args.email = args.email.toLowerCase();
		// - Hash their password
		const password = await bcrypt.hash(args.password, 10);
		// - Create user in database 
		const user = await ctx.db.mutation.createUser({
			data: {
				...args,
				password,
				permissions: { set: ['USER'] }
			}
		}, info);
		// Create the JWT Token for them.
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		console.log(token);
		// - Set JWT as a cookie on the response.
		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365
		});
		// - Return user to the browser
		return user; 
	},
	async signin(parent, { email, password }, ctx, info) {
		// - Check if there is a user with that email.
		email = email.toLowerCase();
		const user = await ctx.db.query.user({ where: { email } });
		if (!user) throw new Error(`No such user found for email ${ email }`);
		// - Check if their password is correct 
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) throw new Error('Invalid password');
		// - Generate JWT Token 
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		// - Set cookie with token 
		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365
		})
		// - Return the user 
		return user;
	},
	async signout(parent, args, ctx, info) {
		ctx.response.clearCookie('token');
		return { message: 'Goodbye!' };
	},
	async requestReset(parent, args, ctx, info) {
		// 1. - Check if real user 
		const user = await ctx.db.query.user({ where: { email: args.email } });
		if (!user) throw new Error(`No such user found for email ${ args.email }`);
		// 2. - Set a reset token and expiry for that user
		const resetToken = (await promisify(randomBytes)(20)).toString('hex');
		const resetTokenExpiry = Date.now() + 3600000;
		const res = await ctx.db.mutation.updateUser({
			where: { email: args.email },
			data: { resetToken, resetTokenExpiry }
		});
		// 3. - Email them that reset token
		return { message: 'response token created'};
	},
	async resetPassword(parent, args, ctx, info) {
		// 1. - Check if the new password and its confirmation match
		if (args.password !== args.confirmPassword) throw new Error("Passwords don't match");
		// 2. - Check the validity of the reset token / expiry
		const [user] = await ctx.db.query.users({
			where: {
				resetToken: args.resetToken,
				resetTokenExpiry_gte: Date.now() - 3600000
			}
		});
		if (!user) throw new Error('This token is either invalid or expired.');
		// 3. - Hash the new password
		const password = await bcrypt.hash(args.password, 10);
		// 4. - Save new password to user and remove reset token field. 
		const updatedUser = await ctx.db.mutation.updateUser({
			where: { email: user.email },
			data: {
				password,
				resetToken: null,
				resetTokenExpiry: null
			}
		});
		// 5. - Generate JWT
		const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
		// 6. - Set JWT in cookie 
		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365 
		});
		// 7. - Return new user. 
		return updatedUser; 
	}
};

module.exports = Mutations;











