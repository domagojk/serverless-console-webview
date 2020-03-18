import './contextMenu.css'
import React from 'react'
import { Icon, Menu } from 'antd'

export function ContextMenu({ ref, onBlur, onEdit, onDelete, style }) {
  return (
    <div
      ref={ref}
      className="context-menu"
      tabIndex={1}
      onBlur={onBlur}
      style={style}
    >
      <Menu
        style={{
          width: 135
        }}
        mode="inline"
      >
        <Menu.Item key="duplicate">
          <Icon type="copy" /> Duplicate
        </Menu.Item>
        <Menu.Item key="edit" onClick={onEdit}>
          <Icon type="edit" /> Edit
        </Menu.Item>
        <Menu.Item key="delete" onClick={onDelete}>
          <Icon type="delete" /> Delete
        </Menu.Item>
      </Menu>
    </div>
  )
}
