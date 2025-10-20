/**
 * SprinkSync - Zone Groups Controller
 *
 * Handles zone group management - create, update, delete groups
 * and run groups of zones together
 */

const { getOne, getAll, runQuery } = require('../config/database');
const { startZoneManaged, isZoneRunning, getRunningZoneCount, queueZone, dequeueZone } = require('../services/zone-manager');
const { getCurrentTimestamp } = require('../utils/helpers');
const logger = require('../services/logger');

/**
 * Get all zone groups with their members
 * GET /api/groups
 */
const getAllGroups = async (req, res) => {
  try {
    const groups = await getAll('SELECT * FROM zone_groups ORDER BY name');

    // Get members for each group
    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        const members = await getAll(
          `SELECT zgm.*, z.name as zone_name, z.gpio_pin
           FROM zone_group_members zgm
           JOIN zones z ON zgm.zone_id = z.id
           WHERE zgm.group_id = ?
           ORDER BY zgm.sequence_order`,
          [group.id]
        );

        return {
          ...group,
          zones: members.map(m => ({
            id: m.zone_id,
            name: m.zone_name,
            gpio_pin: m.gpio_pin,
            sequence_order: m.sequence_order
          })),
          zone_count: members.length
        };
      })
    );

    res.json({
      success: true,
      groups: groupsWithMembers
    });
  } catch (error) {
    logger.error('Error getting zone groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get zone groups'
    });
  }
};

/**
 * Get single zone group by ID
 * GET /api/groups/:id
 */
const getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await getOne('SELECT * FROM zone_groups WHERE id = ?', [id]);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Zone group not found'
      });
    }

    // Get members
    const members = await getAll(
      `SELECT zgm.*, z.name as zone_name, z.gpio_pin
       FROM zone_group_members zgm
       JOIN zones z ON zgm.zone_id = z.id
       WHERE zgm.group_id = ?
       ORDER BY zgm.sequence_order`,
      [id]
    );

    res.json({
      success: true,
      group: {
        ...group,
        zones: members.map(m => ({
          id: m.zone_id,
          name: m.zone_name,
          gpio_pin: m.gpio_pin,
          sequence_order: m.sequence_order
        })),
        zone_count: members.length
      }
    });
  } catch (error) {
    logger.error('Error getting zone group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get zone group'
    });
  }
};

/**
 * Create new zone group
 * POST /api/groups
 */
const createGroup = async (req, res) => {
  try {
    const {
      name,
      description,
      default_duration = 15,
      color = '#3B82F6',
      icon = '🌱',
      custom_image,
      zones = []
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Group name is required'
      });
    }

    if (zones.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one zone must be selected'
      });
    }

    // Create group
    const result = await runQuery(
      `INSERT INTO zone_groups (name, description, default_duration, color, icon, custom_image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), description || null, default_duration, color, icon, custom_image || null]
    );

    const groupId = result.lastID;

    // Add zones to group
    for (let i = 0; i < zones.length; i++) {
      await runQuery(
        `INSERT INTO zone_group_members (group_id, zone_id, sequence_order)
         VALUES (?, ?, ?)`,
        [groupId, zones[i], i]
      );
    }

    logger.info(`Zone group created: ${name} (ID: ${groupId}) with ${zones.length} zones`);

    // Get the created group with members
    const group = await getOne('SELECT * FROM zone_groups WHERE id = ?', [groupId]);
    const members = await getAll(
      `SELECT zgm.*, z.name as zone_name
       FROM zone_group_members zgm
       JOIN zones z ON zgm.zone_id = z.id
       WHERE zgm.group_id = ?
       ORDER BY zgm.sequence_order`,
      [groupId]
    );

    res.status(201).json({
      success: true,
      message: 'Zone group created successfully',
      group: {
        ...group,
        zones: members.map(m => ({
          id: m.zone_id,
          name: m.zone_name,
          sequence_order: m.sequence_order
        })),
        zone_count: members.length
      }
    });
  } catch (error) {
    logger.error('Error creating zone group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create zone group'
    });
  }
};

/**
 * Update zone group
 * PUT /api/groups/:id
 */
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      default_duration,
      color,
      icon,
      custom_image,
      zones
    } = req.body;

    const group = await getOne('SELECT * FROM zone_groups WHERE id = ?', [id]);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Zone group not found'
      });
    }

    // Update group
    await runQuery(
      `UPDATE zone_groups
       SET name = ?, description = ?, default_duration = ?, color = ?, icon = ?, custom_image = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || group.name,
        description !== undefined ? description : group.description,
        default_duration || group.default_duration,
        color || group.color,
        icon || group.icon,
        custom_image !== undefined ? custom_image : group.custom_image,
        id
      ]
    );

    // Update zones if provided
    if (zones && Array.isArray(zones)) {
      // Delete existing members
      await runQuery('DELETE FROM zone_group_members WHERE group_id = ?', [id]);

      // Add new members
      for (let i = 0; i < zones.length; i++) {
        await runQuery(
          `INSERT INTO zone_group_members (group_id, zone_id, sequence_order)
           VALUES (?, ?, ?)`,
          [id, zones[i], i]
        );
      }
    }

    logger.info(`Zone group updated: ${name || group.name} (ID: ${id})`);

    // Get updated group
    const updated = await getOne('SELECT * FROM zone_groups WHERE id = ?', [id]);
    const members = await getAll(
      `SELECT zgm.*, z.name as zone_name
       FROM zone_group_members zgm
       JOIN zones z ON zgm.zone_id = z.id
       WHERE zgm.group_id = ?
       ORDER BY zgm.sequence_order`,
      [id]
    );

    res.json({
      success: true,
      message: 'Zone group updated successfully',
      group: {
        ...updated,
        zones: members.map(m => ({
          id: m.zone_id,
          name: m.zone_name,
          sequence_order: m.sequence_order
        })),
        zone_count: members.length
      }
    });
  } catch (error) {
    logger.error('Error updating zone group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update zone group'
    });
  }
};

/**
 * Delete zone group
 * DELETE /api/groups/:id
 */
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await getOne('SELECT * FROM zone_groups WHERE id = ?', [id]);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Zone group not found'
      });
    }

    await runQuery('DELETE FROM zone_groups WHERE id = ?', [id]);

    logger.info(`Zone group deleted: ${group.name} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Zone group deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting zone group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete zone group'
    });
  }
};

/**
 * Run a zone group (start all zones in sequence)
 * POST /api/groups/:id/run
 */
const runGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration } = req.body;

    const group = await getOne('SELECT * FROM zone_groups WHERE id = ?', [id]);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Zone group not found'
      });
    }

    // Get zones in the group
    const members = await getAll(
      `SELECT z.id, z.name
       FROM zone_group_members zgm
       JOIN zones z ON zgm.zone_id = z.id
       WHERE zgm.group_id = ?
       ORDER BY zgm.sequence_order`,
      [id]
    );

    if (members.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No zones in this group'
      });
    }

    const runDuration = duration || group.default_duration;

    // Check if any zones in the group are already running
    const runningZones = members.filter(z => isZoneRunning(z.id));
    if (runningZones.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Zone ${runningZones[0].name} is already running`
      });
    }

    logger.info(`Starting zone group: ${group.name} (${members.length} zones, ${runDuration}min each)`);

    // Start zones sequentially with delay between each
    // We'll start the first zone immediately, others will be queued
    const startedZones = [];

    // Queue all zones first (for UI feedback)
    for (let i = 0; i < members.length; i++) {
      const zone = members[i];
      const delayMs = i === 0 ? 0 : ((runDuration * 60 * 1000) * i + (5000 * i));

      queueZone(zone.id, {
        groupId: group.id,
        groupName: group.name,
        position: i + 1,
        totalInGroup: members.length,
        scheduledStartMs: Date.now() + delayMs
      });
    }

    // Start first zone
    try {
      await startZoneManaged(members[0].id, runDuration, 'manual', null);
      startedZones.push({
        zone_id: members[0].id,
        zone_name: members[0].name,
        status: 'running',
        duration: runDuration
      });
    } catch (error) {
      logger.error(`Failed to start zone ${members[0].name}:`, error);
      dequeueZone(members[0].id); // Remove from queue if failed
    }

    // Queue remaining zones with delays
    // Each zone will start after the previous one's duration + small buffer
    for (let i = 1; i < members.length; i++) {
      const zone = members[i];
      const delayMs = (runDuration * 60 * 1000) * i + (5000 * i); // duration + 5sec buffer per zone

      setTimeout(async () => {
        try {
          // Check if we can start another zone (respect concurrent limits)
          const settings = await getOne('SELECT max_concurrent_zones FROM system_settings WHERE id = 1');
          const maxConcurrent = settings ? settings.max_concurrent_zones : 2;

          if (getRunningZoneCount() >= maxConcurrent) {
            logger.warn(`Cannot start ${zone.name}: max concurrent zones (${maxConcurrent}) reached`);
            dequeueZone(zone.id);
            return;
          }

          await startZoneManaged(zone.id, runDuration, 'manual', null);
          logger.info(`Group ${group.name}: Started zone ${zone.name} (${i + 1}/${members.length})`);
        } catch (error) {
          logger.error(`Failed to start zone ${zone.name}:`, error);
          dequeueZone(zone.id); // Remove from queue if failed
        }
      }, delayMs);

      startedZones.push({
        zone_id: zone.id,
        zone_name: zone.name,
        status: 'queued',
        duration: runDuration,
        start_in_minutes: Math.floor(delayMs / 60000)
      });
    }

    res.json({
      success: true,
      message: `Started running group: ${group.name}`,
      group: {
        id: group.id,
        name: group.name,
        duration: runDuration,
        total_zones: members.length,
        zones: startedZones
      }
    });
  } catch (error) {
    logger.error('Error running zone group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run zone group'
    });
  }
};

module.exports = {
  getAllGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  runGroup
};
