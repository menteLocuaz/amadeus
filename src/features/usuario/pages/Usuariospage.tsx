import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { ClimbingBoxLoader, BeatLoader } from "react-spinners";
import { 
    FiPlus, FiUsers, FiRefreshCcw, FiSearch, FiEdit2, 
    FiTrash2, FiMapPin, FiActivity,
    FiArrowLeft, FiEye, FiEyeOff, FiCheck, FiX, FiShield
} from "react-icons/fi";
import { PageContainer, PageHeader, HeaderTitle, Toolbar } from "../../../shared/components/UI";
import { useUsuarios } from "../hooks/useUsuarios";
import { USER_COLORS as C, getAvatarColor, getInitials, getStatusStyle, getRolStyle } from "../constants/usuarios";

// ── Animations ────────────────────────────────────────────────────────────────
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const scaleIn = keyframes`from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; }`;

// ── Styled Components ───────────────────────────────────────────────────────
const ContentWrapper = styled.div`animation: ${fadeIn} 0.4s ease-out;`;

const StatsGrid = styled.div`
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px; margin-bottom: 32px;
`;

const StatCard = styled.div<{ $color: string }>`
    background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 20px;
    padding: 24px; display: flex; align-items: center; gap: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative; overflow: hidden;
    &::before {
        content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
        background: ${props => props.$color}; opacity: 0.8;
    }
    &:hover { transform: translateY(-5px); border-color: ${props => props.$color}50; box-shadow: 0 15px 35px rgba(0,0,0,0.3); }
    .icon-box {
        width: 54px; height: 54px; border-radius: 14px; background: ${props => props.$color}15;
        color: ${props => props.$color}; display: flex; align-items: center; justify-content: center; font-size: 24px;
    }
    .info {
        display: flex; flex-direction: column;
        .value { font-size: 28px; font-weight: 800; color: ${C.text}; line-height: 1; }
        .label { font-size: 12px; color: ${C.textMuted}; font-weight: 700; text-transform: uppercase; margin-top: 6px; letter-spacing: 0.5px; }
    }
`;

const MainCard = styled.div`
    background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 24px;
    box-shadow: 0 15px 40px rgba(0,0,0,0.2); overflow: hidden; animation: ${scaleIn} 0.5s ease-out;
`;

const FilterToolbar = styled.div`
    padding: 24px; border-bottom: 1px solid ${C.border}; background: ${C.surface}80;
    display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between;
`;

const SearchBox = styled.div`
    position: relative; flex: 1; min-width: 300px;
    input {
        width: 100%; background: ${C.surface2}; border: 1px solid ${C.border};
        border-radius: 14px; padding: 12px 16px 12px 42px; color: ${C.text};
        font-size: 14px; outline: none; transition: all 0.2s;
        &:focus { border-color: ${C.accent}; box-shadow: 0 0 0 3px ${C.accentSoft}; background: ${C.surface}; }
    }
    svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${C.textMuted}; font-size: 18px; }
`;

const FilterSelects = styled.div`display: flex; gap: 12px; flex-wrap: wrap;`;

const StyledSelect = styled.select`
    background: ${C.surface2}; border: 1px solid ${C.border}; border-radius: 12px;
    padding: 10px 16px; color: ${C.text}; font-size: 13px; font-weight: 600; outline: none;
    cursor: pointer; transition: all 0.2s;
    &:hover { border-color: ${C.accent}80; }
    &:focus { border-color: ${C.accent}; }
`;

const ActionBtn = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
    padding: 12px 24px; border-radius: 14px; border: none; font-weight: 700; font-size: 14px;
    cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s;
    ${props => props.$variant === 'primary' ? css`
        background: linear-gradient(135deg, ${C.accent}, #a855f7); color: white;
        box-shadow: 0 8px 20px rgba(124,58,237,0.3);
        &:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(124,58,237,0.4); }
    ` : props.$variant === 'danger' ? css`
        background: ${C.danger}15; color: ${C.danger}; border: 1px solid ${C.danger}30;
        &:hover { background: ${C.danger}; color: white; }
    ` : css`
        background: ${C.surface2}; color: ${C.text}; border: 1px solid ${C.border};
        &:hover { background: ${C.border}; }
    `}
    &:active { transform: translateY(0); }
    &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

// ── Table styling ─────────────────────────────────────────────────────────────
const TableContainer = styled.div`overflow-x: auto;`;
const Table = styled.table`
    width: 100%; border-collapse: collapse; min-width: 1000px;
    th {
        padding: 18px 24px; background: ${C.surface2}50; text-align: left;
        color: ${C.textMuted}; font-size: 11px; font-weight: 800; text-transform: uppercase;
        letter-spacing: 1px; border-bottom: 2px solid ${C.border};
    }
    td { padding: 16px 24px; border-bottom: 1px solid ${C.border}; vertical-align: middle; }
    tbody tr:hover { background: rgba(124,58,237, 0.04); }
`;

const UserInfo = styled.div`
    display: flex; align-items: center; gap: 14px;
    .avatar {
        width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center;
        justify-content: center; color: white; font-weight: 700; font-size: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .text {
        display: flex; flex-direction: column;
        .name { color: ${C.text}; font-weight: 700; font-size: 14px; }
        .sub { color: ${C.textMuted}; font-size: 12px; }
    }
`;

const Badge = styled.span<{ $bg: string; $color: string }>`
    padding: 5px 12px; border-radius: 12px; font-size: 11px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.5px; background: ${props => props.$bg};
    color: ${props => props.$color}; display: inline-flex; align-items: center; gap: 6px;
    .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
`;

// ── Form styling ──────────────────────────────────────────────────────────────
const FormGrid = styled.div`
    display: grid; grid-template-columns: 1fr 360px; gap: 32px; padding: 32px;
    @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

const Section = styled.div`
    background: ${C.surface2}30; border: 1px solid ${C.border}; border-radius: 20px;
    padding: 24px; margin-bottom: 24px;
    .title { font-size: 15px; font-weight: 700; color: ${C.text}; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
`;

const InputGroup = styled.div<{ $error?: boolean }>`
    margin-bottom: 20px;
    label { display: block; font-size: 11px; font-weight: 700; color: ${C.textMuted}; text-transform: uppercase; margin-bottom: 8px; }
    .input-wrap {
        position: relative;
        input, select {
            width: 100%; background: ${C.surface2}; border: 1px solid ${props => props.$error ? C.danger : C.border};
            border-radius: 12px; padding: 12px 16px; color: ${C.text}; font-size: 14px; outline: none;
            transition: all 0.2s;
            &:focus { border-color: ${C.accent}; box-shadow: 0 0 0 3px ${C.accentSoft}; }
        }
        .suffix { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: ${C.textMuted}; }
    }
    .err { color: ${C.danger}; font-size: 11px; font-weight: 600; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
`;

const PreviewCard = styled.div`
    background: ${C.surface2}50; border: 1px solid ${C.border}; border-radius: 24px;
    padding: 32px; text-align: center;
    .avatar-big {
        width: 100px; height: 100px; border-radius: 30px; margin: 0 auto 20px;
        display: flex; align-items: center; justify-content: center; font-size: 42px; font-weight: 800; color: white;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    h3 { font-size: 22px; font-weight: 800; color: ${C.text}; margin: 0; }
    p { color: ${C.textMuted}; font-size: 14px; margin-top: 8px; }
`;

// ── Main Component ──────────────────────────────────────────────────────────
const UsuariosPage: React.FC = () => {
    const {
        paginated, filteredCount, sucursales, roles, statusList,
        sucursalMap, rolMap, statusMap, isLoading, isSaving, 
        viewMode, editingItem,
        filters, setFilters, resetFilters,
        currentPage, totalPages, setPage,
        openCreate, openEdit, goBack, handleDelete,
        register, handleSubmit, errors, watch, onSubmit
    } = useUsuarios();

    const [showPass, setShowPass] = useState(false);

    // Dynamic Stats
    const totalUsers = filteredCount;
    const activeUsers = paginated.filter(u => statusMap[u.id_status]?.toLowerCase() === 'activo').length; // approximation for UI
    
    const stats = [
        { label: 'Total Usuarios', value: totalUsers, color: C.accent, icon: FiUsers },
        { label: 'En Operación', value: activeUsers || totalUsers, color: C.success, icon: FiActivity },
        { label: 'Restaurantes', value: sucursales.length, color: C.info, icon: FiMapPin },
        { label: 'Roles Definidos', value: roles.length, color: '#a855f7', icon: FiShield },
    ];

    if (isLoading && viewMode === 'list') {
        return (
            <PageContainer>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                    <ClimbingBoxLoader color={C.accent} size={15} />
                    <p style={{ marginTop: 30, fontWeight: 800, color: C.text, letterSpacing: 2, textTransform: 'uppercase', fontSize: 13 }}>Sincronizando Usuarios...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ContentWrapper>
                {/* Header */}
                <PageHeader>
                    <HeaderTitle>
                        <h1><FiUsers /> Gestión de Colaboradores</h1>
                        <p>Plataforma centralizada de accesos, roles y seguridad organizacional</p>
                    </HeaderTitle>
                    <Toolbar>
                        {viewMode === 'list' ? (
                            <ActionBtn $variant="primary" onClick={openCreate}><FiPlus /> Nuevo Usuario</ActionBtn>
                        ) : (
                            <ActionBtn onClick={goBack}><FiArrowLeft /> Volver al Listado</ActionBtn>
                        )}
                    </Toolbar>
                </PageHeader>

                {viewMode === 'list' ? (
                    <>
                        {/* Stats Section */}
                        <StatsGrid>
                            {stats.map(st => (
                                <StatCard key={st.label} $color={st.color}>
                                    <div className="icon-box"><st.icon /></div>
                                    <div className="info">
                                        <div className="value">{st.value}</div>
                                        <div className="label">{st.label}</div>
                                    </div>
                                </StatCard>
                            ))}
                        </StatsGrid>

                        {/* Main Data Card */}
                        <MainCard>
                            <FilterToolbar>
                                <SearchBox>
                                    <FiSearch />
                                    <input 
                                        placeholder="Filtrar por nombre, correo, usuario..." 
                                        value={filters.search} 
                                        onChange={e => setFilters({ search: e.target.value })}
                                    />
                                </SearchBox>
                                <FilterSelects>
                                    <StyledSelect value={filters.id_rol || ""} onChange={e => setFilters({ id_rol: e.target.value || null })}>
                                        <option value="">Todos los Roles</option>
                                        {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
                                    </StyledSelect>
                                    <StyledSelect value={filters.id_sucursal || ""} onChange={e => setFilters({ id_sucursal: e.target.value || null })}>
                                        <option value="">Todas las Sucursales</option>
                                        {sucursales.map(s => <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre_sucursal}</option>)}
                                    </StyledSelect>
                                    <ActionBtn onClick={resetFilters} title="Limpiar Filtros"><FiRefreshCcw /></ActionBtn>
                                </FilterSelects>
                            </FilterToolbar>

                            <TableContainer>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Colaborador</th>
                                            <th>Username</th>
                                            <th>Rol & Permisos</th>
                                            <th>Ubicación</th>
                                            <th>Estatus</th>
                                            <th style={{ textAlign: 'center' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map(u => {
                                            const roleName = rolMap[u.id_rol] || "User";
                                            const stName = statusMap[u.id_status] || "Unknown";
                                            const stStyle = getStatusStyle(stName);
                                            const rlStyle = getRolStyle(roleName);
                                            return (
                                                <tr key={u.id_usuario}>
                                                    <td>
                                                        <UserInfo>
                                                            <div className="avatar" style={{ background: getAvatarColor(u.nombre) }}>
                                                                {getInitials(u.nombre)}
                                                            </div>
                                                            <div className="text">
                                                                <span className="name">{u.nombre}</span>
                                                                <span className="sub">{u.email || u.correo}</span>
                                                            </div>
                                                        </UserInfo>
                                                    </td>
                                                    <td><code style={{ color: C.accent, fontWeight: 700 }}>@{u.username}</code></td>
                                                    <td>
                                                        <Badge $bg={rlStyle.bg} $color={rlStyle.color}>{roleName}</Badge>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.textMuted, fontSize: 13 }}>
                                                            <FiMapPin size={14} /> {sucursalMap[u.id_sucursal] || "Base"}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge $bg={stStyle.bg} $color={stStyle.color}>
                                                            <div className="dot" /> {stName}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                                            <ActionBtn style={{ padding: 8 }} onClick={() => openEdit(u)}><FiEdit2 size={16} /></ActionBtn>
                                                            <ActionBtn style={{ padding: 8 }} $variant="danger" onClick={() => handleDelete(u.id_usuario)}><FiTrash2 size={16} /></ActionBtn>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </TableContainer>

                            {/* Pagination */}
                            <div style={{ padding: 24, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 600 }}>Página {currentPage} de {totalPages || 1}</span>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <ActionBtn disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</ActionBtn>
                                    <ActionBtn disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} $variant="secondary">Siguiente</ActionBtn>
                                </div>
                            </div>
                        </MainCard>
                    </>
                ) : (
                    /* Consolidated Form Section */
                    <MainCard>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <FormGrid>
                                <div>
                                    <Section>
                                        <div className="title"><FiUsers /> Datos de Identidad</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                            <InputGroup $error={!!errors.nombre}>
                                                <label>Nombre(s)</label>
                                                <div className="input-wrap"><input {...register("nombre")} placeholder="Ej: Juan" /></div>
                                                {errors.nombre && <div className="err"><FiX /> {errors.nombre.message as string}</div>}
                                            </InputGroup>
                                            <InputGroup $error={!!errors.apellido}>
                                                <label>Apellidos</label>
                                                <div className="input-wrap"><input {...register("apellido")} placeholder="Ej: Pérez" /></div>
                                                {errors.apellido && <div className="err"><FiX /> {errors.apellido.message as string}</div>}
                                            </InputGroup>
                                            <InputGroup $error={!!errors.usu_dni}>
                                                <label>DNI / Documento Identidad</label>
                                                <div className="input-wrap"><input {...register("usu_dni")} placeholder="12345678" /></div>
                                                {errors.usu_dni && <div className="err"><FiX /> {errors.usu_dni.message as string}</div>}
                                            </InputGroup>
                                            <InputGroup $error={!!errors.email}>
                                                <label>Correo Electrónico Corp.</label>
                                                <div className="input-wrap"><input {...register("email")} placeholder="nombre@empresa.com" /></div>
                                                {errors.email && <div className="err"><FiX /> {errors.email.message as string}</div>}
                                            </InputGroup>
                                        </div>
                                    </Section>

                                    <Section>
                                        <div className="title"><FiShield /> Seguridad & Acceso</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                            <InputGroup $error={!!errors.username} style={{ gridColumn: 'span 2' }}>
                                                <label>Nombre de Usuario (Red)</label>
                                                <div className="input-wrap"><input {...register("username")} placeholder="jperez" /></div>
                                                {errors.username && <div className="err"><FiX /> {errors.username.message as string}</div>}
                                            </InputGroup>
                                            <InputGroup $error={!!errors.password}>
                                                <label>Contraseña {editingItem && '(Opcional)'}</label>
                                                <div className="input-wrap">
                                                    <input {...register("password")} type={showPass ? "text" : "password"} placeholder="••••••••" />
                                                    <button type="button" className="suffix" onClick={() => setShowPass(!showPass)}>{showPass ? <FiEyeOff /> : <FiEye />}</button>
                                                </div>
                                                {errors.password && <div className="err"><FiX /> {errors.password.message as string}</div>}
                                            </InputGroup>
                                            <InputGroup $error={!!errors.confirmPassword}>
                                                <label>Confirmar Password</label>
                                                <div className="input-wrap"><input {...register("confirmPassword")} type="password" placeholder="••••••••" /></div>
                                                {errors.confirmPassword && <div className="err"><FiX /> {errors.confirmPassword.message as string}</div>}
                                            </InputGroup>
                                        </div>
                                    </Section>

                                    <Section>
                                        <div className="title"><FiShield /> Configuración POS & Acceso</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                            <InputGroup $error={!!errors.usu_pin_pos}>
                                                <label>PIN de Punto de Venta</label>
                                                <div className="input-wrap"><input {...register("usu_pin_pos")} placeholder="Ej: 1234" maxLength={8} /></div>
                                                {errors.usu_pin_pos && <div className="err"><FiX /> {errors.usu_pin_pos.message as string}</div>}
                                            </InputGroup>
                                            <InputGroup $error={!!errors.usu_tarjeta_nfc}>
                                                <label>Código Tarjeta NFC</label>
                                                <div className="input-wrap"><input {...register("usu_tarjeta_nfc")} placeholder="NFC-XXXXX" /></div>
                                                {errors.usu_tarjeta_nfc && <div className="err"><FiX /> {errors.usu_tarjeta_nfc.message as string}</div>}
                                            </InputGroup>
                                            <InputGroup $error={!!errors.nombre_ticket} style={{ gridColumn: 'span 2' }}>
                                                <label>Nombre en Ticket (Impresión)</label>
                                                <div className="input-wrap"><input {...register("nombre_ticket")} placeholder="Ej: Juan P." /></div>
                                                {errors.nombre_ticket && <div className="err"><FiX /> {errors.nombre_ticket.message as string}</div>}
                                            </InputGroup>
                                            <InputGroup style={{ gridColumn: 'span 2' }}>
                                                <label>Sucursales de Acceso Permitido</label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                                    {sucursales.map(s => (
                                                        <label key={s.id_sucursal} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, textTransform: 'none', color: '#e2e8f0', letterSpacing: 'normal' }}>
                                                            <input 
                                                                type="checkbox" 
                                                                value={s.id_sucursal} 
                                                                {...register("sucursales_acceso")}
                                                                style={{ width: 16, height: 16, accentColor: '#7c3aed' }}
                                                            />
                                                            {s.nombre_sucursal}
                                                        </label>
                                                    ))}
                                                </div>
                                            </InputGroup>
                                        </div>
                                    </Section>
                                </div>

                                <div>
                                    <PreviewCard>
                                        {(() => {
                                            const wName = watch("nombre", "");
                                            const wLast = watch("apellido", "");
                                            const wTicket = watch("nombre_ticket", "");
                                            const wPin = watch("usu_pin_pos", "");
                                            const full = `${wName} ${wLast}`.trim() || "Usuario Nuevo";
                                            return (
                                                <>
                                                    <div className="avatar-big" style={{ background: getAvatarColor(full) }}>{getInitials(full)}</div>
                                                    <h3>{full}</h3>
                                                    <p>{watch("email") || "Sin correo asignado"}</p>
                                                    
                                                    {wTicket && (
                                                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                                                            <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase' }}>Ticket</div>
                                                            <div style={{ fontWeight: 600, color: C.accent }}>{wTicket}</div>
                                                        </div>
                                                    )}
                                                    {wPin && (
                                                        <div style={{ marginTop: 8 }}>
                                                            <Badge $bg="rgba(16,185,129,0.15)" $color="#10b981">PIN Configurado</Badge>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </PreviewCard>

                                    <Section style={{ marginTop: 24 }}>
                                        <div className="title">Asignación de Empresa</div>
                                        <InputGroup $error={!!errors.id_rol}>
                                            <label>Rol Organizacional</label>
                                            <div className="input-wrap">
                                                <select {...register("id_rol")}>
                                                    <option value="">Seleccionar rol...</option>
                                                    {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
                                                </select>
                                            </div>
                                        </InputGroup>
                                        <InputGroup $error={!!errors.id_sucursal}>
                                            <label>Sucursal de Operación</label>
                                            <div className="input-wrap">
                                                <select {...register("id_sucursal")}>
                                                    <option value="">Seleccionar restaurante...</option>
                                                    {sucursales.map(s => <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre_sucursal}</option>)}
                                                </select>
                                            </div>
                                        </InputGroup>
                                        <InputGroup $error={!!errors.id_status}>
                                            <label>Estatus de Cuenta</label>
                                            <div className="input-wrap">
                                                <select {...register("id_status")}>
                                                    {statusList.map(s => <option key={s.id_status} value={s.id_status}>{s.std_descripcion}</option>)}
                                                </select>
                                            </div>
                                        </InputGroup>
                                    </Section>

                                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                        <ActionBtn type="submit" $variant="primary" style={{ flex: 1 }} disabled={isSaving}>
                                            {isSaving ? <BeatLoader size={8} color="white" /> : <><FiCheck /> {editingItem ? 'Guardar Cambios' : 'Registrar Colaborador'}</>}
                                        </ActionBtn>
                                    </div>
                                </div>
                            </FormGrid>
                        </form>
                    </MainCard>
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default UsuariosPage;