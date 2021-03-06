/**
 * author       Mat Hopwood
 * copyright    2014 Mat Hopwood
 * More info    http://booty5.com
 */
"use strict";
/**
 * A ParticleActor is derived from a {@link b5.Actor} and is an actor that can generate and display particles
 * (a particle system), a particle can be an actor of any kind, including another particle actor. To use a particle
 * system actor you create an instance of ParticleActor then create and add individual actor particles, specifying
 * a life span (the amount of time the particle exists), a spawn delay (the amount of time to wait before spawning
 * the particle) and the total number of times the particle can be reborn. When a particle system has no particles
 * left alive it will be destroyed. A ParticleActor should be added to a {@link b5.Scene} or another {@link b5.Actor}
 * that is part of a scene hierarchy
 *
 * Supports the following event handlers:
 *
 * - onParticlesEnd() - Called when The particle system has finished and no particles are left
 * - onParticleLost(particle) - Called each time a particle is lost, if this function returns false then the particle
 * will not be destroyed
 *
 * Note that when an actor is added to a particle actor it is given the following additional properties:
 * - vo - Opacity velocity
 * - vsx - X axis scale velocity
 * - vsy - Y axis scale velocity
 *
 * Example of creating a particle system particle by particle:
 *
 *      var particles = new b5.ParticleActor();
 *      particles.gravity = 40;
 *      my_scene.addActor(particles);   // Add particle system actor to scene for processing
 *      for (var t = 0; t < 20; t++)
 *      {
 *          var particle = new b5.Actor();
 *          particle.fill_style = "#FFFF00";
 *          particle.radius = 30;
 *          particle.vx = Math.random() * 200 - 100;
 *          particle.vy = Math.random() * 200 - 100;
 *          particle.vo = -1 / 2;
 *          particles.addParticle(particle, 2, 0, t * 0.1);
 *      }
 *
 * Example of creating a particle explosion using the utility method:
 *
 *      var particles = new b5.ParticleActor();
 *      my_scene.addActor(particles);     // Add particle system actor to scene for processing
 *      particles.generateExplosion(50, b5.ArcActor, 2, 50, 10, 1, 0.999, {
 *          fill_style: "#ffff00",
 *          radius: 30
 *      );
 *
 * Example of creating a particle system that represents a smoke plume using a utility method:
 *
 *      var particles = new b5.ParticleActor();
 *      my_scene.addActor(particles);     // Add particle system actor to scene for processing
 *      particles.generatePlume(20, b5.ArcActor, 3, 40, 10, 0.25, 1, {
 *          fill_style: "#ffff00",
 *          radius: 20,
 *          vsx: 0.6,
 *          vsy: 0.6
 *      });
 *
 * <b>Examples</b>
 *
 * For a complete overview of the Actor class see {@link http://booty5.com/html5-game-engine/booty5-html5-game-engine-introduction/actors/ Booty5 Actor Overview}
 *
 * @class b5.ParticleActor
 * @augments b5.Actor
 * @constructor
 * @returns {b5.ParticleActor} The created ParticleActor
 *
 * @property {number}                   gravity                             - Amount of gravity to apply to particles (default is 0)
 *
 */


//
b5.ParticleActor = function()
{
    // Call constructor
    b5.Actor.call(this);

    // Internal variables

    // public variables
    this.type = b5.Actor.Type_Particle; // Type of actor
    this.gravity = 0;                   // Gravity applied to particles
    this.added_callback = null;         // Callback that is called when a particle is added
    this.reset_callback = null;         // Callback that is called when a particle is reset
};
b5.ParticleActor.prototype = new b5.Actor();
b5.ParticleActor.prototype.constructor = b5.ParticleActor;
b5.ParticleActor.prototype.parent = b5.Actor.prototype;

/**
 * Resets the particle to its initial spawn state
 * @private
 * @param actor
 */
b5.ParticleActor.prototype.resetParticle = function(actor)
{
    actor.life_time = 0;
    if (actor.orphaned)
    {
        var tpos = this.transformPoint(actor.org_x + this.x, actor.org_y + this.y);
        actor.x = tpos.x;
        actor.y = tpos.y;
    }
    else
    {
        actor.x = actor.org_x;
        actor.y = actor.org_y;
    }
    actor.rotation = actor.org_rotation;
    actor.scale_x = actor.org_scale_x;
    actor.scale_y = actor.org_scale_y;
    actor.depth = actor.org_depth;
    actor.opacity = actor.org_opacity;
    actor.current_frame = actor.org_current_frame;
    actor.vr = actor.org_vr;
    actor.vx = actor.org_vx;
    actor.vy = actor.org_vy;
    actor.vd = actor.org_vd;
    actor.vo = actor.org_vo;
    actor.vsx = actor.org_vsx;
    actor.vsy = actor.org_vsy;
    if (this.reset_callback !== null)
        this.reset_callback(actor);
};

/**
 * Adds an actor to the particle system as a particle
 * @param actor {b5.Actor} The actor to add as a particle, can be any derived actor type
 * @param life_span {number} The life span of the particle in seconds
 * @param num_lives{number} The number of times a particle will respawn before it is destroyed (0 for infinite)
 * @param spawn_delay{number} The number of seconds to wait before spawning this particle
 * @returns {b5.Actor} The created actor particle
 */
b5.ParticleActor.prototype.addParticle = function(actor, life_span, num_lives, spawn_delay)
{
    this.addActor(actor);

    if (actor.vo === undefined) actor.vo = 0;
    if (actor.vsx === undefined) actor.vsx = 0;
    if (actor.vsy === undefined) actor.vsy = 0;

    actor.life_time = -spawn_delay;     // Current life time (set initially to a negative time to delay spawning)
    actor.life_span = life_span;        // Amount of time the particle will be alive
    actor.num_lives = num_lives;        // Total number of times the particle will respawn (0 for infinite)
    if (actor.life_time < 0)
    {
        actor.active = false;
        actor.visible = false;
    }
    actor.org_num_lives = actor.num_lives
    actor.org_x = actor.x;
    actor.org_y = actor.y;
    actor.org_rotation = actor.rotation;
    actor.org_scale_x = actor.scale_x;
    actor.org_scale_y = actor.scale_y;
    actor.org_depth = actor.depth;
    actor.org_opacity = actor.opacity;
    actor.org_current_frame = actor.current_frame;
    actor.org_vr = actor.vr;
    actor.org_vx = actor.vx;
    actor.org_vy = actor.vy;
    actor.org_vd = actor.vd;
    actor.org_vo = actor.vo;
    actor.org_vsx = actor.vsx;
    actor.org_vsy = actor.vsy;
    if (actor.orphaned)
    {
        var tpos = this.transformPoint(actor.org_x + this.x, actor.org_y + this.y);
        actor.x = tpos.x;
        actor.y = tpos.y;
    }

    if (this.added_callback !== null)
        this.added_callback(actor);
    
    return actor;
};

/**
 * Overrides the base {@link b5.Actor}.update() method to perform particle system update
 * @param dt {number} Time that has passed since this actor was last updated in seconds
 */
b5.ParticleActor.prototype.update = function(dt)
{
    var particles = this.actors;
    var count = particles.length;

    // Destroy actor if no particles left
    if (count === 0)
    {
        if (this.onParticlesEnd !== undefined)
            this.onParticlesEnd();
        this.destroy();
    }
    else
    {
        // Update particles
        for (var t = count - 1; t >=0 ; t--)
        {
            var p = particles[t];
            p.life_time += dt;

            var life_time = p.life_time;
            if (life_time >= 0)
            {
                if (life_time - dt < 0 && life_time >= 0)
                {
                    p.active = true;
                    p.visible = true;
                }

                if (p.active)
                {
                    p.scale_x += p.vsx * dt;
                    p.scale_y += p.vsy * dt;
                    p.opacity += p.vo * dt;
                    if (p.opacity < 0)
                        p.opacity = 0;
                    p.vy += this.gravity * dt;
                    p.update(dt);

                    if (life_time >= p.life_span)
                    {
                        if (p.num_lives > 0)
                            p.num_lives--;
                        if (p.num_lives > 0 || p.org_num_lives === 0)
                            this.resetParticle(p);

                        else
                        {
                            if (this.onParticleLost !== undefined) {
                                if (this.onParticleLost(p))
                                    p.destroy();
                            }
                            else
                                p.destroy();
                        }
                    }
                }
            }
        }
    }

    return this.baseUpdate(dt);
};

/**
 * Utility method to create a basic explosion particle system
 * @param count {number} Total number of particles to create
 * @param type {object|string} The actor type of each particle created, for example b5.ArcActor or "ArcActor"
 * @param duration {number} The total duration of the particle system in seconds
 * @param speed {number} The speed at which the particles blow apart
 * @param spin_speed {number} The speed at which particles spin
 * @param rate {number} The rate at which particles are created
 * @param damping {number} A factor to reduce velocity of particles each frame, values greater than 1 will increase velocities
 * @param properties {object} A collection of actor specific property / value pairs that will be assigned to each created particle
 */
b5.ParticleActor.prototype.generateExplosion = function(count, type, duration, speed, spin_speed, rate, damping, properties)
{
    this.updateParentTransforms();
    for (var t = 0; t < count; t++)
    {
        var p;
        if (typeof type === "string")
            p = new b5[type]();
        else
            p = new type();
        for (var prop in properties)
            p[prop] = properties[prop];
        p.vr += Math.random() * spin_speed;
        p.vx += Math.random() * speed - speed/2;
        p.vy += Math.random() * speed - speed/2;
        p.vx_damping = damping;
        p.vy_damping = damping;
        p.vo = -1 / duration;
        this.addParticle(p, duration, 1, t / (count * rate));
    }
};

/**
 * Utility method to create a basic smoke plume particle system
 * @param count {number} Total number of particles to create
 * @param type {object|string} The actor type of each particle created, for example b5.ArcActor or "ArcActor"
 * @param duration {number} The total duration of the particle system in seconds
 * @param speed {number} The speed at which the particles rise
 * @param spin_speed {number} The speed at which particles spin
 * @param rate {number} The rate at which particles are created
 * @param damping {number} A factor to reduce velocity of particles each frame, values greater than 1 will increase velocities
 * @param properties {object} A collection of actor specific property / value pairs that will be assigned to each created particle
 */
b5.ParticleActor.prototype.generatePlume = function(count, type, duration, speed, spin_speed, rate, damping, properties)
{
    this.updateParentTransforms();
    for (var t = 0; t < count; t++)
    {
        var p;
        if (typeof type === "string")
            p = new b5[type]();
        else
            p = new type();
        for (var prop in properties)
            p[prop] = properties[prop];
        p.vr += Math.random() * spin_speed;
        p.vx += Math.random() * speed - speed / 2;
        p.vy += Math.random() * -speed - speed / 2;
        p.vx_damping = damping;
        p.vy_damping = damping;
        p.vo = -1 / duration;
        this.addParticle(p, duration, 0, t / (count * rate));
    }
};

/**
 * Utility method to create a basic rain particle system
 * @param count {number} Total number of particles to create
 * @param type {object|string} The actor type of each particle created, for example b5.ArcActor or "ArcActor"
 * @param duration {number} The total duration of the particle system in seconds
 * @param speed {number} The speed at which the particles fall
 * @param spin_speed {number} The speed at which particles spin
 * @param rate {number} rate at which particles are created
 * @param damping {number} A factor to reduce velocity of particles each frame, values greater than 1 will increase velocities
 * @param width {number} The width of the area over which to generate particles
 * @param properties {object} A collection of actor specific property / value pairs that will be assigned to each created particle
 */
b5.ParticleActor.prototype.generateRain = function(count, type, duration, speed, spin_speed, rate, damping, width, properties)
{
    this.updateParentTransforms();
    for (var t = 0; t < count; t++)
    {
        var p;
        if (typeof type === "string")
            p = new b5[type]();
        else
            p = new type();
        for (var prop in properties)
            p[prop] = properties[prop];
        p.x = Math.random() * width - width / 2;
        p.vr += Math.random() * spin_speed;
        p.vy += Math.random() * speed + speed / 2;
        p.vx_damping = damping;
        p.vy_damping = damping;
        p.vo = -1 / duration;
        this.addParticle(p, duration, 0, t / (count * rate));
    }
};


