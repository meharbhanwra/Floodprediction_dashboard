# create_db.py
from server import app, db, User

with app.app_context():
    # Create the database tables
    db.create_all()

    # Check if the user already exists
    if not User.query.filter_by(username='authority1@gov.in').first():
        print("Creating default authority user...")

        # Create a new user object
        authority_user = User(username='authority1@gov.in')

        # Set their password (this will be hashed automatically)
        authority_user.set_password('SafePassword123')

        # Add to the database
        db.session.add(authority_user)
        db.session.commit()
        print("User 'authority1@gov.in' with password 'SafePassword123' created.")
    else:
        print("User already exists.")