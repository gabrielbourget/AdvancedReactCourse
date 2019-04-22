const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');

const Mutations = {
	/*******************/
	/* - CREATE ITEM - */
	/*******************/
	async createItem(parent, args, ctx, info) {
		// -> TODO: Check if logged in.
		if (!ctx.request.userId) {
			throw new Error('You must be logged in to do that.');
		}
		const item = await ctx.db.mutation.createItem({
			data: { 
				user: {
					// - Establish relationship between item being added 
					//   and user that added it. 
					connect: {
						id: ctx.request.userId
					}
				},
				...args
			}
		}, info);

		return item;
	},

	/*******************/
	/* - UPDATE ITEM - */
	/*******************/	
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

	/*******************/
	/* - DELETE ITEM - */
	/*******************/	
	async deleteItem(parent, args, ctx, info) {
		const where = { id: args.id };
		// - Find Item 
		const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);
		// - Check user permissions 
		const ownsItem = item.user.id === ctx.request.userId;
		const hasPermissions = 
			ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission));
		if (!ownsItem || !hasPermissions) {
			throw new Error('You don\'t have permission to do that');	
		}
		// - Delete Item
		return ctx.db.mutation.deleteItem({ where }, info);
	},

	/***************/
	/* - SIGN UP - */
	/***************/	
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

	/***************/
	/* - SIGN IN - */
	/***************/
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

	/****************/
	/* - SIGN OUT - */
	/****************/	
	async signout(parent, args, ctx, info) {
		ctx.response.clearCookie('token');
		return { message: 'Goodbye!' };
	},

	/****************/
	/* - SIGN OUT - */
	/****************/		
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
		const mailRes = await transport.sendMail({
			from: 'hellogabrielbourget@gmail.com',
			to: user.email,
			subject: 'Your Password Reset Token',
			html: makeANiceEmail(`Your password reset token is here. \n\n 
														<a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
															Click here to reset.
														</a>`)
		});
		// 4. - Return success message
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
	},

	/**************************/
	/* - UPDATE PERMISSIONS - */
	/**************************/	
	async updatePermissions(parent, args, ctx, info) {
		// 1. - Check if user is logged in.
		if (!ctx.request.userId) throw new Error('You must be logged in to do this.');
		// 2. - Query the current user 
		const currentUser = await ctx.db.query.user({ 
			where: { id: ctx.request.userId } 
		}, info);
		// 3. - Check if they have permissions to do this 
		hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
		// 4. - Update the permissions 
		return ctx.db.mutation.updateUser({
			data: {
				permissions: {
					set: args.permissions 
				}
			},
			where: { id: args.userId }
		}, info);
	},

	/*******************/
	/* - ADD TO CART - */
	/*******************/	
	async addToCart(parent, args, ctx, info) {
		// 1. - Make sure they are signed in
		const { userId } = ctx.request;
		if (!userId) throw new Error('Please sign in first.');
		// 2. - Query the user's current cart
		const [existingCartItem] = await ctx.db.query.cartItems({
			where: {
				user: { id: userId },
				item: { id: args.id }
			}
		});
		// 3. - Check if that item is already in their cart,
		// 			increment by 1 if it is.
		if (existingCartItem) {
			return ctx.db.mutation.updateCartItem({
				where: { id: existingCartItem.id },
				data: { quantity: existingCartItem.quantity + 1 }
			}, info);
		}
		// 4. - If it's not, create a frewh CartItem for that user.
		return ctx.db.mutation.createCartItem({
			data: {
				user: {
					connect: { id: userId }
				},
				item: {
					connect: { id: args.id }
				}
			}
		}, info);
	}
};

module.exports = Mutations;











